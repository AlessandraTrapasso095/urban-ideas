/* tipi per le API GoREST */

export type UserStatus = 'active' | 'inactive';
export type UserGender = 'male' | 'female';
export type UserSearchField = 'name' | 'email';
export interface User {

  id: number;

  name: string;

  email: string;

  gender: UserGender;

  status: UserStatus;
}

export type CreateUserDto = Omit<User, 'id'>;
/* tipo per creare/aggiornare utente: è un User senza id */

export interface PaginatedResponse<T> {
  data: T[];
  /* dati reali */

  page: number;

  pages: number;

  limit: number;

  total: number;
}

export interface Post {
  /* post come arriva da GoREST */

  id: number;

  user_id: number;

  title: string;

  body: string;
}

export type CreatePostDto = Omit<Post, 'id'>;
/* per creare un post: è un Post senza id */

export interface Comment {
  /* commento come arriva da GoREST */

  id: number;

  post_id: number;

  name: string;

  email: string;

  body: string;
}

export type CreateCommentDto = Omit<Comment, 'id' | 'post_id'>;
/* per creare commento: non mando id e non mando post_id nel body */
