import { action, computed, makeAutoObservable, observable, type IObservableArray } from "mobx";
import { Role } from "@structures";
import AppStore from "./AppStore";

export default class RoleStore {
	@observable readonly roles: IObservableArray<Role>;

	constructor(private readonly app: AppStore) {
		this.roles = observable.array([]);

		makeAutoObservable(this);
	}

	@action
	add(role: Role) {
		this.roles.push(role);
		this.sortRoles();
	}

	@action
	update(role: Role) {
		const existing = this.roles.find((r) => r.id === role.id);
		if (existing) {
			existing.update(role);
		} else {
			this.add(role);
		}
	}

	@action
	addAll(roles: Role[]) {
		roles.forEach((role) => this.add(role));
	}

	@action
	remove(id: string) {
		const index = this.roles.findIndex((r) => r.id === id);
		if (index !== -1) {
			this.roles.splice(index, 1);
		}
	}

	@action
	sortRoles() {
		this.roles.replace(this.roles.slice().sort((a: Role, b: Role) => a.position - b.position));
	}

	@action
	updateRole(role: Role) {
		const existingRole = this.roles.find((r) => r.id === role.id);
		if (existingRole) {
			existingRole.update(role);
		} else {
			this.add(role);
		}
	}

	get(id: string) {
		return this.roles.find((r) => r.id === id);
	}

	@computed
	get all() {
		return Array.from(this.roles.values());
	}

	@computed
	get count() {
		return this.roles.length;
	}

	@computed
	get hasRoles() {
		return this.roles.length > 0;
	}
}

