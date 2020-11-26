import { AsyncStorage } from "react-native";
import { create } from "mobx-persist";

import UserStore from "./user-store";
import SettingsStore from "./settings-store";

export const userStore = new UserStore();
export const settingsStore = new SettingsStore();

export const hydrate = create({
  storage: AsyncStorage
});

export async function hydrateUserStore() {
  // TODO: Check if we need to hydrate or not
  if (!!userStore.userId) {
    return;
  }
  await hydrate("user-store", userStore);
  await hydrate("settings-store", settingsStore);
}
