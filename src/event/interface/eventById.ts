import { EventDocument } from 'src/schema/event.schema';

export interface IEventById extends EventDocument {
  joined: boolean;
  isHost: boolean;
  hasPassword: boolean;
}
