"use client";

import { useMemo, useState, useEffect, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { KeyRound, Plus, Save, ShieldCheck, Trash2 } from "lucide-react";
import {
  apiErrorMessage,
  useCreateAdminEmployeeMutation,
  useCreateAdminRoleMutation,
  useDeleteAdminEmployeeMutation,
  useDeleteAdminRoleMutation,
  useGetAdminEmployeesQuery,
  useGetAdminEmployeePermissionsQuery,
  useGetAdminRolesQuery,
  useResetAdminEmployeePasswordMutation,
  useSetAdminEmployeePermissionsMutation,
  useSetAdminRolePermissionsMutation,
  useUpdateAdminEmployeeMutation,
  useUpdateAdminRoleMutation,
  type ApiRecord,
  type RootState,
} from "@/lib/store";

const obj = (value: unknown): ApiRecord => typeof value === "object" && value !== null ? value as ApiRecord : {};
const list = (value: unknown): ApiRecord[] => Array.isArray(value) ? value as ApiRecord[] : [];
const str = (value: unknown, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);
const names = (value: unknown) => list(value).map((item) => typeof item === "string" ? item : str(obj(item).name, "" )).filter(Boolean);

export function AdminAccess({ kind }: { kind: "employees" | "roles" }) {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const employees = useGetAdminEmployeesQuery(undefined, { skip: kind !== "employees" });
  const roles = useGetAdminRolesQuery(undefined);
  const [createEmployee, createEmployeeState] = useCreateAdminEmployeeMutation();
  const [updateEmployee, updateEmployeeState] = useUpdateAdminEmployeeMutation();
  const [deleteEmployee] = useDeleteAdminEmployeeMutation();
  const [resetPassword] = useResetAdminEmployeePasswordMutation();
  const [createRole, createRoleState] = useCreateAdminRoleMutation();
  const [updateRole] = useUpdateAdminRoleMutation();
  const [deleteRole] = useDeleteAdminRoleMutation();
  const [setRolePermissions] = useSetAdminRolePermissionsMutation();
  const [setEmployeePermissions] = useSetAdminEmployeePermissionsMutation();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", password_confirmation: "", role: "" });
  const [roleName, setRoleName] = useState("");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const roleRows = roles.data?.items ?? [];
  const roleChoices = roleRows.filter((row) => !["root", "shop", "customer", "driver"].includes(String(row.name)));
  const selectedRole = roleRows.find((row) => Number(row.id) === selectedRoleId);
  const permissionRows = roles.data?.permissions ?? [];
  const visiblePermissions = useMemo(() => permissionRows.filter((permission) => str(permission.name, "").toLowerCase().includes(permissionSearch.toLowerCase())), [permissionRows, permissionSearch]);
  const rows = kind === "employees" ? employees.data?.items ?? [] : roleRows;
  const loading = kind === "employees" ? employees.isLoading : roles.isLoading;
  const queryError = kind === "employees" ? employees.error : roles.error;
  const title = kind === "employees" ? "Administrative staff" : "Roles and permissions";
  const can = (permission: string) => Boolean(currentUser?.roles?.includes("root") || currentUser?.permissions?.includes(permission));

  useEffect(() => {
    setSelectedPermissions(names(selectedRole?.permissions));
  }, [selectedRoleId]);

  async function run(action: () => Promise<unknown>, message: string) {
    setError(""); setSuccess("");
    try { await action(); setSuccess(message); }
    catch (cause) { setError(apiErrorMessage(cause, "The change could not be saved.")); }
  }

  async function submitEmployee(event: FormEvent) {
    event.preventDefault();
    const payload: Record<string, unknown> = { name: form.name, email: form.email || null, phone: form.phone, role: form.role };
    if (!selectedEmployeeId) { payload.password = form.password; payload.password_confirmation = form.password_confirmation; }
    await run(async () => {
      if (selectedEmployeeId) await updateEmployee({ id: selectedEmployeeId, body: payload }).unwrap();
      else await createEmployee(payload).unwrap();
      setCreateOpen(false); setSelectedEmployeeId(null); setForm({ name: "", email: "", phone: "", password: "", password_confirmation: "", role: "" });
    }, selectedEmployeeId ? "Staff account updated." : "Staff account created.");
  }

  async function submitRole(event: FormEvent) {
    event.preventDefault();
    if (!roleName.trim()) return;
    await run(async () => { await createRole({ name: roleName.trim() }).unwrap(); setRoleName(""); }, "Role created.");
  }

  function editEmployee(row: ApiRecord) {
    setSelectedEmployeeId(Number(row.id));
    setSelectedRoleId(null);
    setForm({ name: str(row.name, ""), email: str(row.email, ""), phone: str(row.phone, ""), password: "", password_confirmation: "", role: names(row.roles)[0] || "" });
    setCreateOpen(true);
  }

  return <main className="page-content">
    <div className="page-heading"><div><p className="eyebrow">Administration access</p><h1>{title}</h1><p>Manage staff accounts and the permissions assigned to each role.</p></div>
      {kind === "employees" && can("admin.employee.create") && <button className="primary-button" onClick={() => { setSelectedEmployeeId(null); setForm({ name: "", email: "", phone: "", password: "", password_confirmation: "", role: roleChoices[0] ? String(roleChoices[0].name) : "" }); setCreateOpen(true); }}><Plus size={15} /> Add employee</button>}
    </div>
    {error && <div className="error-box" role="alert">{error}</div>}{success && <div className="success-box" role="status">{success}</div>}
    {queryError && <div className="error-box" role="alert">{apiErrorMessage(queryError, `Could not load ${title.toLowerCase()}.`)}</div>}
    <section className="panel"><div className="panel-heading"><div><h2>{kind === "employees" ? "Staff accounts" : "Configured roles"}</h2><p>{rows.length} records</p></div>{kind === "roles" && can("admin.role.create") && <form onSubmit={submitRole} className="search-bar"><input aria-label="New role name" placeholder="New role name" value={roleName} onChange={(event) => setRoleName(event.target.value)} /><button className="primary-button" disabled={createRoleState.isLoading}><Plus size={14} /> Add role</button></form>}</div>
      <div className="table-wrap"><table className="data-table"><thead><tr>{kind === "employees" ? <><th>Name</th><th>Email</th><th>Phone</th><th>Roles</th><th>Actions</th></> : <><th>Role</th><th>Members</th><th>Permissions</th><th>Actions</th></>}</tr></thead><tbody>
        {rows.map((row) => <tr key={str(row.id)}>{kind === "employees" ? <><td><strong>{str(row.name)}</strong></td><td>{str(row.email)}</td><td>{str(row.phone)}</td><td>{names(row.roles).join(", ") || "—"}</td><td className="action-cell">{can("admin.employee.edit") && <button className="table-action" onClick={() => editEmployee(row)}>Edit</button>}{can("admin.employee.permission") && <button className="table-action" onClick={() => { setSelectedEmployeeId(Number(row.id)); setSelectedRoleId(null); }}>Permissions</button>}{can("admin.employee.reset.password") && <button className="table-action" onClick={async () => { const password = window.prompt("Enter a new password (at least 8 characters)"); if (!password) return; await run(() => resetPassword({ id: Number(row.id), password, password_confirmation: password }).unwrap(), "Password reset."); }}><KeyRound size={13} /> Reset</button>}{can("admin.employee.destroy") && Number(row.id) !== currentUser?.id && <button className="table-action danger" onClick={() => { if (window.confirm(`Remove ${str(row.name)} from management?`)) void run(() => deleteEmployee(Number(row.id)).unwrap(), "Employee removed."); }}><Trash2 size={13} /> Remove</button>}</td></> : <><td><strong>{str(row.name)}</strong>{["root", "admin"].includes(str(row.name)) && <span className="status-pill warning"> Built-in</span>}</td><td>{str(row.users_count, "0")}</td><td>{list(row.permissions).length}</td><td className="action-cell"><button className="table-action" disabled={["root", "admin", "shop", "customer", "driver"].includes(str(row.name))} onClick={() => setSelectedRoleId(Number(row.id))}><ShieldCheck size={13} /> Permissions</button>{can("admin.role.edit") && !["root", "admin", "shop", "customer", "driver"].includes(str(row.name)) && <button className="table-action" onClick={async () => { const name = window.prompt("Role name", str(row.name)); if (name && name !== row.name) await run(() => updateRole({ id: Number(row.id), name }).unwrap(), "Role renamed."); }}>Rename</button>}{can("admin.role.destroy") && <button disabled={Number(row.users_count) > 0 || ["root", "admin", "shop", "customer", "driver"].includes(str(row.name))} className="table-action danger" onClick={() => { if (window.confirm(`Delete role ${str(row.name)}?`)) void run(() => deleteRole(Number(row.id)).unwrap(), "Role deleted."); }}><Trash2 size={13} /> Delete</button>}</td></>}</tr>)}
        {!rows.length && <tr><td className="table-empty" colSpan={5}>{loading ? "Loading live records…" : "No records found."}</td></tr>}
      </tbody></table></div>
    </section>

    {kind === "roles" && selectedRole && <section className="panel" style={{ marginTop: 18 }}><div className="panel-heading"><div><h2>{str(selectedRole.name)} permissions</h2><p>These permissions apply to every staff member assigned this role.</p></div><button className="primary-button" onClick={() => void run(() => setRolePermissions({ id: Number(selectedRole.id), permissions: selectedPermissions }).unwrap(), "Role permissions saved.")}><Save size={14} /> Save permissions</button></div><PermissionList rows={visiblePermissions} selected={selectedPermissions} onToggle={togglePermission} search={permissionSearch} onSearch={setPermissionSearch} />
      </section>}
    {kind === "employees" && selectedEmployeeId && !createOpen && <EmployeePermissionPanel key={selectedEmployeeId} id={selectedEmployeeId} onClose={() => setSelectedEmployeeId(null)} onSave={(permissions) => run(() => setEmployeePermissions({ id: selectedEmployeeId, permissions }).unwrap(), "Employee permissions saved.")} />}
    {createOpen && <div className="modal-backdrop" onClick={() => setCreateOpen(false)}><form className="modal-card" onSubmit={submitEmployee} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><h3>{selectedEmployeeId ? "Edit staff account" : "Create staff account"}</h3><button type="button" className="secondary-button" onClick={() => setCreateOpen(false)}>Close</button></div><div className="form-two"><Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} required /><Field label="Email" value={form.email} onChange={(email) => setForm({ ...form, email })} type="email" /><Field label="Phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} required /><label className="field"><span>Role</span><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} required>{roleChoices.map((role) => <option key={str(role.id)} value={str(role.name)}>{str(role.name)}</option>)}</select></label>{!selectedEmployeeId && <><Field label="Password" value={form.password} onChange={(password) => setForm({ ...form, password })} type="password" required /><Field label="Confirm password" value={form.password_confirmation} onChange={(password_confirmation) => setForm({ ...form, password_confirmation })} type="password" required /></>}</div><div className="modal-footer"><button className="primary-button" disabled={createEmployeeState.isLoading || updateEmployeeState.isLoading}>Save staff account</button></div></form></div>}
  </main>;

  function togglePermission(permission: string) { setSelectedPermissions((current) => current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]); }
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="field"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} /></label>;
}

function PermissionList({ rows, selected, onToggle, search, onSearch }: { rows: ApiRecord[]; selected: string[]; onToggle: (name: string) => void; search: string; onSearch: (value: string) => void }) {
  return <><input className="search-input" aria-label="Filter permissions" placeholder="Filter permission names…" value={search} onChange={(event) => onSearch(event.target.value)} />{!rows.length && <p className="login-note">No permissions match the filter.</p>}<div className="permission-grid">{rows.map((permission) => { const name = str(permission.name, ""); return <label className="permission-item" key={str(permission.id)}><input type="checkbox" checked={selected.includes(name)} onChange={() => onToggle(name)} />{name}</label>; })}</div></>;
}

function EmployeePermissionPanel({ id, onClose, onSave }: { id: number; onClose: () => void; onSave: (permissions: string[]) => Promise<void> }) {
  const { data, isLoading, error } = useGetAdminEmployeePermissionsQuery(id);
  const allPermissions = list(data?.permissions);
  const [search, setSearch] = useState("");
  const initial = names(data?.custom_permissions).concat(names(data?.role_permissions)).filter((name, index, all) => all.indexOf(name) === index).filter((name) => !names(data?.denied_permissions).includes(name));
  const [selected, setSelected] = useState<string[] | null>(null);
  useEffect(() => {
    if (data && selected === null) {
      setSelected(names(data.custom_permissions).concat(names(data.role_permissions)).filter((name, index, all) => all.indexOf(name) === index).filter((name) => !names(data.denied_permissions).includes(name)));
    }
  }, [data, selected]);
  const value = selected ?? initial;
  const filtered = allPermissions.filter((permission) => str(permission.name, "").toLowerCase().includes(search.toLowerCase()));
  return <section className="panel" style={{ marginTop: 18 }}><div className="panel-heading"><div><h2>Employee permission overrides</h2><p>{str(obj(data?.user).name)} · inherited role permissions can be changed per person</p></div><div className="action-cell"><button className="secondary-button" onClick={onClose}>Close</button><button className="primary-button" onClick={() => void onSave(value)}><Save size={14} /> Save permissions</button></div></div>{error && <div className="error-box">{apiErrorMessage(error, "Could not load permissions.")}</div>}{isLoading ? <p>Loading permissions…</p> : <><input className="search-input" aria-label="Filter permissions" placeholder="Filter permission names…" value={search} onChange={(event) => setSearch(event.target.value)} /><div className="permission-grid">{filtered.map((permission) => { const name = str(permission.name, ""); return <label className="permission-item" key={str(permission.id)}><input type="checkbox" checked={value.includes(name)} onChange={() => setSelected(value.includes(name) ? value.filter((item) => item !== name) : [...value, name])} />{name}</label>; })}</div></>}</section>;
}
