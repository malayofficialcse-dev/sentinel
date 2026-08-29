import { Entity, EntityType } from '../types';
import { mockEntities } from '../data/mockData';
import { delay } from './api';

export const entityApi = {
  async getEntities(filters?: { type?: EntityType; search?: string }): Promise<Entity[]> {
    await delay(200);
    let list = [...mockEntities];
    if (filters?.type) {
      list = list.filter((e) => e.type === filters.type);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (e) => e.value.toLowerCase().includes(q) || e.displayName.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async getEntityById(id: string): Promise<Entity | null> {
    await delay(150);
    return (
      mockEntities.find((e) => e.id.toLowerCase() === id.toLowerCase() || e.value.toLowerCase() === id.toLowerCase()) ||
      null
    );
  },
};
