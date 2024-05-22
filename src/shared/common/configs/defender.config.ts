import { registerAs } from '@nestjs/config';

export default registerAs('defender', () => ({
  relayKeyMumbai: process.env.RELAY_KEY_MUMBAI,
  relaySecretMumbai: process.env.RELAY_SECRET_MUMBAI,
}));
