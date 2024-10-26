import { logoutAction } from "./actions";

export function LogoutButton() {
	return (
		<form action={logoutAction}>
			<button>Sign out</button>
		</form>
	);
}
