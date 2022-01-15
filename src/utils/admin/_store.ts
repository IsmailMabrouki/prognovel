import { writable, Writable } from "svelte/store";

export const isAdminGUIConnected: Writable<boolean> = writable(false);
export const adminPageData: Writable<any> = writable({});
