/* tipi e DTO condivisi per le API GoREST */

export type UserStatus = 'active' | 'inactive';
/* per lo status utente che GoREST usa (active/inactive) */

export type UserGender = 'male' | 'female';
/* per il gender utente */

export type UserSearchField = 'name' | 'email';
/* per decidere su quale campo cercare */

export interface User {
  /* interfaccia per tipizzare un utente come arriva da GoREST */

  id: number;
  /* id numerico dell'utente */

  name: string;
  /* nome completo */

  email: string;
  /* email */

  gender: UserGender;
  /* gender */

  status: UserStatus;
  /* status */
}

export type CreateUserDto = Omit<User, 'id'>;
/* tipo per creare/aggiornare utente: è un User senza id */

export interface PaginatedResponse<T> {
  data: T[];
  /* dati reali (array) */

  page: number;
  /* pagina corrente */

  pages: number;
  /* numero totale pagine */

  limit: number;
  /* perPage */

  total: number;
  /* totale record */
}

export interface Post {
  /* post come arriva da GoREST */

  id: number;
  /* id post */

  user_id: number;
  /* id utente autore */

  title: string;
  /* titolo */

  body: string;
  /* contenuto */
}

export type CreatePostDto = Omit<Post, 'id'>;
/* per creare un post: è un Post senza id */

export interface Comment {
  /* commento come arriva da GoREST */

  id: number;
  /* id commento */

  post_id: number;
  /* id del post */

  name: string;
  /* nome autore commento */

  email: string;
  /* email autore commento */

  body: string;
  /* testo commento */
}

export type CreateCommentDto = Omit<Comment, 'id' | 'post_id'>;
/* per creare commento: non mando id e non mando post_id nel body */
