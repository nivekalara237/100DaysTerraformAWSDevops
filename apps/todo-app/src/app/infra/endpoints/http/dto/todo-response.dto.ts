export interface TodoResponseDto {
  id: string;
  name: string;
  owner: {
    fullName: string;
    email: string
  },
  createdAt: string;
  updatedAt: string;
}
