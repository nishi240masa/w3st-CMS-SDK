export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Article extends BaseEntity {
  title: string;
  content: string;
  eyecatch?: Media;
}

export interface Media extends BaseEntity {
  url: string;
  alt: string;
}