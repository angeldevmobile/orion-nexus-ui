export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: unknown;
  description?: string;
}

export interface ComponentRating {
  id: number;
  component_id: number;
  user_id: number;
  score: number;
  comment?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Component {
  id: number;
  name: string;
  description?: string;
  category: 'ui' | 'layout' | 'form' | 'navigation' | 'data' | 'feedback' | 'overlay' | 'other';
  code: string;
  preview?: string;
  props: ComponentProp[]; 
  framework: 'react' | 'vue' | 'angular';
  creator_id: number; // Foreign key a users(id)
  is_public: boolean; // snake_case para PostgreSQL
  downloads: number;
  rating?: number; // Calculado desde component_ratings
  tags: string[]; // TEXT[] en PostgreSQL
  created_at: Date;
  updated_at: Date;
}

export interface ComponentWithCreator extends Component {
  creator: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
  rating_count?: number;
  ratings?: (ComponentRating & {
    user: {
      id: number;
      username: string;
      avatar?: string;
    };
  })[];
}

export interface CreateComponentData {
  name: string;
  description?: string;
  category: Component['category'];
  code: string;
  preview?: string;
  props?: ComponentProp[];
  framework: Component['framework'];
  tags?: string[];
}

export interface UpdateComponentData extends Partial<CreateComponentData> {
  is_public?: boolean;
}