import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'react-toastify';

import { Token } from './utils';
import { HttpCode } from './const';
import { ValidationErrorField } from './types/error';

const BACKEND_URL = 'http://localhost:4000';
const REQUEST_TIMEOUT = 5000;

export const createAPI = (): AxiosInstance => {
  const api = axios.create({
    baseURL: BACKEND_URL,
    timeout: REQUEST_TIMEOUT,
  });

  api.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      const token = Token.get();

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    }
  );

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      toast.dismiss();
      const {response} = error;
      if (response) {
        switch (response.status) {
          case HttpCode.BadRequest:
            (response.data.details)
              ? response.data.details
                .forEach(
                  (detail: ValidationErrorField) =>
                    detail.messages
                      .forEach(
                        (message: string) => toast.info(message),
                      ),
                )
              : toast.info(response.data.message);
            break;
          case HttpCode.NoAuth:
          case HttpCode.NotFound:
            toast.info(response.data.error);
            toast.info(response.data.message);
            break;
          case HttpCode.Conflict:
            toast.info(response.data.message);
            break;
          case HttpCode.ServerInternal:
            toast.error('INTERNAL SERVER ERROR');
            break;
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
};
