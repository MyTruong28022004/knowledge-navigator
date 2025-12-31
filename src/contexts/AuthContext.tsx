import React, { createContext, useContext, useState, useCallback } from "react";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role?: UserRole) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for different roles
const mockUsers: Record<UserRole, User> = {
  employee: {
    id: "user-1",
    name: "Nguyễn Văn An",
    email: "an.nguyen@company.com",
    role: "employee",
    department: "Engineering",
    avatar: undefined,
  },
  department_manager: {
    id: "user-2",
    name: "Trần Thị Bình",
    email: "binh.tran@company.com",
    role: "department_manager",
    department: "Engineering",
    avatar: undefined,
  },
  knowledge_manager: {
    id: "user-3",
    name: "Lê Văn Cường",
    email: "cuong.le@company.com",
    role: "knowledge_manager",
    department: "Knowledge Management",
    avatar: undefined,
  },
  admin: {
    id: "user-4",
    name: "Phạm Thị Dung",
    email: "dung.pham@company.com",
    role: "admin",
    department: "IT Administration",
    avatar: undefined,
  },
};

// Role hierarchy for permission checking
const roleHierarchy: Record<UserRole, number> = {
  employee: 1,
  department_manager: 2,
  knowledge_manager: 3,
  admin: 4,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUsers.knowledge_manager);

  const isAuthenticated = user !== null;

  const login = useCallback((role: UserRole = "employee") => {
    setUser(mockUsers[role]);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;

      // Simple permission mapping based on role hierarchy
      const permissionRequirements: Record<string, UserRole[]> = {
        chat: ["employee", "department_manager", "knowledge_manager", "admin"],
        search: [
          "employee",
          "department_manager",
          "knowledge_manager",
          "admin",
        ],
        "documents.view": [
          "employee",
          "department_manager",
          "knowledge_manager",
          "admin",
        ],
        "documents.edit": ["knowledge_manager", "admin", "department_manager"],
        "documents.approve": ["knowledge_manager", "admin"],
        approvals: ["knowledge_manager", "admin"],
        "users.manage": ["admin"],
        "audit.view": ["knowledge_manager", "admin"],
        settings: ["knowledge_manager", "admin"],
      };

      const allowedRoles = permissionRequirements[permission];
      return allowedRoles ? allowedRoles.includes(user.role) : false;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, hasRole, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
