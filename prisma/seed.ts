import { toChecksumAddress } from 'web3-utils';
import { Chain, ContractType, PrismaClient } from '@prisma/client';
import { isEqual, cloneDeep } from 'lodash';

const prisma = new PrismaClient();

async function updateDistributors(): Promise<void> {
  const contracts = await prisma.contract.aggregateRaw({
    pipeline: [
      {
        $match: {
          'metadata.distributor': { $type: 'object' },
        },
      },
    ],
  });

  if (!contracts.length) {
    console.log('No contracts distributors to update');
    return;
  }

  const updatedContracts = (contracts as unknown as any[]).map((contract) => {
    const distributors = [contract.metadata.distributor];
    const metadata = {
      ...contract.metadata,
      distributors,
    };
    delete metadata.distributor;
    contract.metadata = metadata;

    return contract;
  });

  await prisma.$transaction(async (tx) => {
    const updates = [];
    for (const updatedContract of updatedContracts) {
      const update = tx.contract.update({
        where: {
          id: updatedContract._id.$oid,
        },
        data: {
          metadata: updatedContract.metadata,
          v: { increment: 1 },
        },
      });
      //@ts-ignore
      updates.push(update);
    }
    await Promise.all(updates);
  });

  console.log(`Updated ${updatedContracts.length} contracts distributors`);
}

const updateValveAddressesToChecksumAddresses = async () => {
  let counter = 0;
  const contracts = await prisma.contract.findMany({
    where: { type: ContractType.VALVE },
  });

  for (const contract of contracts) {
    let { address, metadata } = cloneDeep(contract);

    if (address) {
      address = toChecksumAddress(address);
    }
    if (metadata !== null) {
      if (metadata['controller']) {
        try {
          metadata['controller'] = {
            name: metadata['controller'].name,
            address: toChecksumAddress(metadata['controller'].address),
          };
        } catch (err) {
          metadata['controller'] = null;
        }
      }
      if (metadata['recipients']) {
        metadata['recipients'] = metadata['recipients']
          .map((recipient) => {
            try {
              return {
                name: recipient.name,
                address: toChecksumAddress(recipient.address),
                revenue: recipient.revenue,
              };
            } catch (err) {
              return null;
            }
          })
          .filter((value) => value ?? false);
      }
      if (metadata['distributors']) {
        metadata['distributors'] = metadata['distributors']
          .map((distributor) => {
            try {
              return {
                name: distributor.name,
                address: toChecksumAddress(distributor.address),
              };
            } catch (err) {
              return null;
            }
          })
          .filter((value) => value ?? false);
      }
      if (metadata['currencies']) {
        metadata['currencies'] = metadata['currencies']
          .map((currency) => {
            try {
              if (currency.title === null) {
                return null;
              } else {
                return {
                  title: currency.title,
                  address:
                    address === null || address === undefined || address === ''
                      ? null
                      : toChecksumAddress(currency.address),
                };
              }
            } catch (err) {
              return null;
            }
          })
          .filter((value) => value ?? false);
        if (metadata['currencies'].length === 0) {
          if (
            contract.chain === Chain.ETHEREUM ||
            contract.chain === Chain.ETHEREUM_GOERLI
          ) {
            metadata['currencies'] = [
              {
                title: 'ETH',
                address: null,
              },
            ];
          } else if (
            contract.chain === Chain.POLYGON ||
            contract.chain === Chain.POLYGON_MUMBAI
          ) {
            metadata['currencies'] = [
              {
                title: 'MATIC',
                address: null,
              },
            ];
          }
        }
      }

      if (
        contract.address !== address ||
        !isEqual(contract.metadata, metadata)
      ) {
        await prisma.contract.update({
          where: { id: contract.id },
          data: {
            address: address,
            metadata: metadata,
            v: { increment: 1 },
          },
        });
        counter = counter + 1;
      }
    }
  }

  if (counter === 0) {
    console.log('No contracts addresses to update');
    return;
  }

  console.log(`Updated ${counter} contracts addresses`);
};

async function main(): Promise<void> {
  await updateDistributors();
  await updateValveAddressesToChecksumAddresses();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect);
