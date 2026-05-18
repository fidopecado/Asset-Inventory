export type Role = "guest" | "admin";

const AUTH_KEY = "asset_inventory_role";

export function getCurrentRole(): Role {
    if (typeof window === "undefined") return "guest";
    return (localStorage.getItem(AUTH_KEY) as Role) || "guest";
}

export function loginAs(role: Role) {
    localStorage.setItem(AUTH_KEY, role);
}

export function logout() {
    localStorage.removeItem(AUTH_KEY);
}