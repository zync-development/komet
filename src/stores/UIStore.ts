import { makeAutoObservable } from "mobx";

class UIStore {
	isProfileCardOpen = false;

	constructor() {
		makeAutoObservable(this);
	}

	toggleProfileCard() {
		this.isProfileCardOpen = !this.isProfileCardOpen;
	}
}

export default UIStore;
