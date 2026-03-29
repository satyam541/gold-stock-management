"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
    Plus,
    Trash2,
    Edit3,
    X,
    Save,
    Shield,
    ShieldCheck,
    User,
    Eye,
    EyeOff,
    Loader2,
    UserPlus,
    Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface UserType {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export default function UsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });

    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            }
        } catch {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const addUser = async () => {
        if (!form.name.trim() || !form.email.trim() || !form.password) {
            toast.error("Name, email, and password are required");
            return;
        }
        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const err = await res.json();
                toast.error(err.error || "Failed to create user");
                return;
            }

            toast.success("User created successfully!");
            setForm({ name: "", email: "", password: "", role: "user" });
            setShowForm(false);
            fetchUsers();
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (user: UserType) => {
        setEditingId(user.id);
        setEditForm({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
        });
        setShowPassword(false);
    };

    const saveEdit = async () => {
        if (!editForm.name.trim() || !editForm.email.trim()) {
            toast.error("Name and email are required");
            return;
        }
        if (editForm.password && editForm.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setSaving(true);
        try {
            const body: any = {
                name: editForm.name,
                email: editForm.email,
                role: editForm.role,
            };
            if (editForm.password) body.password = editForm.password;

            const res = await fetch(`/api/users/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json();
                toast.error(err.error || "Failed to update user");
                return;
            }

            toast.success("User updated successfully!");
            setEditingId(null);
            fetchUsers();
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (user: UserType) => {
        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !user.isActive }),
            });

            if (!res.ok) {
                const err = await res.json();
                toast.error(err.error || "Failed to update user");
                return;
            }

            toast.success(
                `User ${user.isActive ? "deactivated" : "activated"} successfully!`
            );
            fetchUsers();
        } catch {
            toast.error("Failed to update user status");
        }
    };

    const deleteUser = async (user: UserType) => {
        if (!confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)) return;

        try {
            const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });

            if (!res.ok) {
                const err = await res.json();
                toast.error(err.error || "Failed to delete user");
                return;
            }

            toast.success("User deleted successfully!");
            fetchUsers();
        } catch {
            toast.error("Failed to delete user");
        }
    };

    // Non-admin users shouldn't see this page
    if (session?.user?.role !== "admin") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-2">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h2 className="font-display text-lg font-semibold">Access Denied</h2>
                    <p className="text-sm text-muted-foreground">
                        You don&apos;t have permission to manage users.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-display text-lg font-semibold">User Management</h3>
                        <p className="text-xs text-muted-foreground">
                            {users.length} user{users.length !== 1 ? "s" : ""} total
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                    }}
                    className="flex items-center gap-2 h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    {showForm ? (
                        <>
                            <X className="h-4 w-4" /> Cancel
                        </>
                    ) : (
                        <>
                            <UserPlus className="h-4 w-4" /> Add User
                        </>
                    )}
                </button>
            </div>

            {/* Add User Form */}
            {showForm && (
                <div className="rounded-xl border border-border bg-card p-6">
                    <h4 className="font-medium mb-4">Create New User</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="John Doe"
                                className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="user@example.com"
                                className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Min. 6 characters"
                                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                Role
                            </label>
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={addUser}
                            disabled={saving}
                            className="flex items-center gap-2 h-9 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            Create User
                        </button>
                    </div>
                </div>
            )}

            {/* Users List */}
            <div className="rounded-xl border border-border bg-card">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No users found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {users.map((user) => (
                            <div key={user.id} className="p-4">
                                {editingId === user.id ? (
                                    /* Edit Mode */
                                    <div className="space-y-3">
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, name: e.target.value })
                                                    }
                                                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, email: e.target.value })
                                                    }
                                                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                                    New Password (leave blank to keep)
                                                </label>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={editForm.password}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, password: e.target.value })
                                                    }
                                                    placeholder="Leave blank to keep current"
                                                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                                    Role
                                                </label>
                                                <select
                                                    value={editForm.role}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, role: e.target.value })
                                                    }
                                                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="flex items-center gap-1 h-8 rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted transition-colors"
                                            >
                                                <X className="h-3 w-3" /> Cancel
                                            </button>
                                            <button
                                                onClick={saveEdit}
                                                disabled={saving}
                                                className="flex items-center gap-1 h-8 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                                            >
                                                {saving ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <Save className="h-3 w-3" />
                                                )}
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Display Mode */
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shrink-0",
                                                user.role === "admin" ? "gold-gradient" : "bg-blue-500"
                                            )}
                                        >
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium truncate">{user.name}</p>
                                                {user.role === "admin" ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/20 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                                                        <ShieldCheck className="h-3 w-3" /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/20 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400">
                                                        <User className="h-3 w-3" /> User
                                                    </span>
                                                )}
                                                {!user.isActive && (
                                                    <span className="rounded-full bg-red-100 dark:bg-red-900/20 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => toggleActive(user)}
                                                className={cn(
                                                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                                    user.isActive
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400"
                                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                )}
                                            >
                                                {user.isActive ? "Active" : "Inactive"}
                                            </button>
                                            <button
                                                onClick={() => startEdit(user)}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
                                                title="Edit user"
                                            >
                                                <Edit3 className="h-3.5 w-3.5" />
                                            </button>
                                            {user.id !== session?.user?.id && (
                                                <button
                                                    onClick={() => deleteUser(user)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                    title="Delete user"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
