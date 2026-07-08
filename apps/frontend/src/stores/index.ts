/** Client-side state stores — populated in Phase 2 */

export interface StoreState {
  isLoading: boolean;
  error: string | null;
}

export const initialStoreState: StoreState = {
  isLoading: false,
  error: null,
};
