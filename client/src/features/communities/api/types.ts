export type Community = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  backgroundColor: string;
  verified: boolean;
  owner: {
    id: string;
    username: string;
  };
};
