export interface ITask {
  name?: string;
  created?: string;
  dateEnd?: string;
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  profile_picture: string;
  role: "user" | "author" | "admin";
  created_at: string;
  updated_at: string;
}

export interface IUserAuth {
  username: string;
  email: string;
  profile_picture?: string;
  role?: "user" | "author" | "admin";
}
