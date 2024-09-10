import { useAuth } from '@/hooks/useAuth';  // Keep this to access user and roles

export const useActiveRole = () => {
    const { roles, selectedRole: authSelectedRole } = useAuth();  // Extract roles and selectedRole from useAuth

    // Determine the current role, defaulting to "isAnonymous"
    const selectedRole = authSelectedRole || (roles && roles.length > 0 ? roles[0].roleName : "isAnonymous");

    // Binary flags for roles
    const isAnonymous = selectedRole === "isAnonymous";
    const isRegionalOrganizer = selectedRole === "RegionalOrganizer";
    const isRegionalAdmin = selectedRole === "RegionalAdmin";
    const isSystemOwner = selectedRole === "SystemOwner";
    const isNamedUser = selectedRole === "NamedUser";

    return {
        selectedRole,
        isAnonymous,
        isRegionalOrganizer,
        isRegionalAdmin,
        isSystemOwner,
        isNamedUser,
    };
};