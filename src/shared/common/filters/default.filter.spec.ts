import { DefaultFilter } from './default.filter';
import { HttpException } from '@nestjs/common';

describe('DefaultFilter', () => {
  let filter: DefaultFilter;

  beforeEach(() => {
    filter = new DefaultFilter();
  });

  it('should catch HttpException and return response with status and message', () => {
    const message = 'Error message';
    const errors = ['Error 1', 'Error 2'];
    const status = 400;
    const httpException = new HttpException({ message, errors }, status);
    const host = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue({
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      }),
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    filter.catch(httpException, host);

    expect(host.getResponse().status).toHaveBeenCalledWith(status);
    expect(host.getResponse().json).toHaveBeenCalledWith({ message, errors });
  });

  it('should catch generic Error and return response with 500 status and a message', () => {
    const message = 'Generic error message';
    const error = new Error(message);
    const host = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue({
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      }),
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    filter.catch(error, host);

    expect(host.getResponse().status).toHaveBeenCalledWith(500);
    expect(host.getResponse().json).toHaveBeenCalledWith({
      message: 'Something went wrong',
      errors: [],
    });
  });
});
