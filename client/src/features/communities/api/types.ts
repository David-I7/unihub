export type Community = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  owner: {
    id: string;
    username: string;
  };
};
