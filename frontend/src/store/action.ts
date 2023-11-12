import type { History } from 'history';
import { AxiosInstance, AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { UserAuth, Offer, Comment, CommentAuth, FavoriteAuth, UserRegister, NewOffer } from '../types/types';
import { ApiRoute, AppRoute, HttpCode } from '../const';
import { Token } from '../utils';
import { adaptAuthUserToClient, adaptCommentToClient, adaptCommentsToClient, adaptOfferToClient, adaptOffersToClient, adaptUserToClient } from '../adapters/adapter-to-client';
import RentOfferBasicRDO from '../dto/rent-offer/rdo/rent-offer-basic.rdo';
import RentOfferFullRDO from '../dto/rent-offer/rdo/rent-offer-full.rdo';
import UserBasicRDO from '../dto/user/rdo/user-basic.rdo';
import UserAuthRDO from '../dto/user/rdo/user-auth.rdo';
import { adaptExistOfferToServer, adaptNewCommentToServer, adaptNewOfferToServer, adaptRegisterUserToServer } from '../adapters/adapters-to-server';
import CommentRDO from '../dto/comment/rdo/comment.rdo';

type Extra = {
  api: AxiosInstance;
  history: History;
};

export const Action = {
  FETCH_OFFERS: 'offers/fetch',
  FETCH_OFFER: 'offer/fetch',
  POST_OFFER: 'offer/post-offer',
  EDIT_OFFER: 'offer/edit-offer',
  DELETE_OFFER: 'offer/delete-offer',
  FETCH_FAVORITE_OFFERS: 'offers/fetch-favorite',
  FETCH_PREMIUM_OFFERS: 'offers/fetch-premium',
  FETCH_COMMENTS: 'offer/fetch-comments',
  POST_COMMENT: 'offer/post-comment',
  POST_FAVORITE: 'offer/post-favorite',
  DELETE_FAVORITE: 'offer/delete-favorite',
  LOGIN_USER: 'user/login',
  LOGOUT_USER: 'user/logout',
  FETCH_USER_STATUS: 'user/fetch-status',
  REGISTER_USER: 'user/register',
};

export const fetchOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<RentOfferBasicRDO[]>(ApiRoute.Offers);

    return adaptOffersToClient(data);
  });

export const fetchFavoriteOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_FAVORITE_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<Offer[]>(`${ApiRoute.Offers}${ApiRoute.Favorite}`);

    return data;
  });

export const fetchOffer = createAsyncThunk<Offer, Offer['id'], { extra: Extra }>(
  Action.FETCH_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;

    try {
      const { data } = await api.get<RentOfferFullRDO>(`${ApiRoute.Offers}/${id}`);

      return adaptOfferToClient(data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NotFound) {
        history.push(AppRoute.NotFound);
      }

      return Promise.reject(error);
    }
  });

export const postOffer = createAsyncThunk<Offer, NewOffer, { extra: Extra }>(
  Action.POST_OFFER,
  async (newOffer, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.post<RentOfferFullRDO>(ApiRoute.Offers, adaptNewOfferToServer(newOffer));
    history.push(`${AppRoute.Property}/${data.id}`);

    return adaptOfferToClient(data);
  });

export const editOffer = createAsyncThunk<Offer, Offer, { extra: Extra }>(
  Action.EDIT_OFFER,
  async (offer, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.patch<RentOfferFullRDO>(`${ApiRoute.Offers}/${offer.id}`, adaptExistOfferToServer(offer));
    history.push(`${AppRoute.Property}/${data.id}`);

    return adaptOfferToClient(data);
  });

export const deleteOffer = createAsyncThunk<string, string, { extra: Extra }>(
  Action.DELETE_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;
    await api.delete(`${ApiRoute.Offers}/${id}`);
    history.push(AppRoute.Root);

    return id;
  });

export const fetchPremiumOffers = createAsyncThunk<Offer[], string, { extra: Extra }>(
  Action.FETCH_PREMIUM_OFFERS,
  async (cityName, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<RentOfferBasicRDO[]>(`${ApiRoute.Offers}${ApiRoute.Premium}?city=${cityName}`);

    return adaptOffersToClient(data);
  });

export const fetchComments = createAsyncThunk<Comment[], Offer['id'], { extra: Extra }>(
  Action.FETCH_COMMENTS,
  async (id, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<CommentRDO[]>(`${ApiRoute.Offers}/${id}${ApiRoute.Comments}`);

    return adaptCommentsToClient(data);
  });

export const fetchUserStatus = createAsyncThunk<UserAuth['email'], undefined, { extra: Extra }>(
  Action.FETCH_USER_STATUS,
  async (_, { extra }) => {
    const { api } = extra;

    try {
      const { data } = await api.get<UserBasicRDO>(ApiRoute.Login);

      return adaptUserToClient(data).email;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        Token.drop();
      }

      return Promise.reject(error);
    }
  });

export const loginUser = createAsyncThunk<UserAuth['email'], UserAuth, { extra: Extra }>(
  Action.LOGIN_USER,
  async ({ email, password }, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.post<UserAuthRDO>(ApiRoute.Login, { email, password });
    const { token } = adaptAuthUserToClient(data);

    Token.save(token);
    history.push(AppRoute.Root);

    return email;
  });

export const logoutUser = createAsyncThunk<void, undefined, { extra: Extra }>(
  Action.LOGOUT_USER,
  async () => {
    Token.drop();

    return Promise.resolve();
  });

export const registerUser = createAsyncThunk<void, UserRegister, { extra: Extra }>(
  Action.REGISTER_USER,
  async ({avatar, ...registerData}, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.post<UserAuthRDO>(ApiRoute.Register, adaptRegisterUserToServer(registerData));
    const { token } = data;

    Token.save(token);

    if (avatar && avatar.name) {
      const payload = new FormData();
      payload.append('avatar', avatar);
      await api.post(`/users/${data.id}/upload${ApiRoute.Avatar}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    history.push(AppRoute.Login);
  });


export const postComment = createAsyncThunk<Comment, CommentAuth, { extra: Extra }>(
  Action.POST_COMMENT,
  async (newComment, { extra }) => {
    const { api } = extra;
    const { data } = await api.post<CommentRDO>(ApiRoute.Comments, adaptNewCommentToServer(newComment));

    return adaptCommentToClient(data);
  });

export const postFavorite = createAsyncThunk<Offer, FavoriteAuth, { extra: Extra }>(
  Action.POST_FAVORITE, async (id, { extra }) => {
    const { api, history } = extra;

    try {
      const { data } = await api.put<RentOfferFullRDO>(
        `/users${ApiRoute.Favorite}/${id}?isFav=1`
      );

      return adaptOfferToClient(data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        history.push(AppRoute.Login);
      }

      return Promise.reject(error);
    }
  });

export const deleteFavorite = createAsyncThunk<Offer, FavoriteAuth, { extra: Extra }>(
  Action.DELETE_FAVORITE, async (id, { extra }) => {
    const { api, history } = extra;

    try {
      const { data } = await api.put<RentOfferFullRDO>(
        `/users${ApiRoute.Favorite}/${id}?isFav=0`
      );

      return adaptOfferToClient(data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        history.push(AppRoute.Login);
      }

      return Promise.reject(error);
    }
  });
