import React, { useState } from "react";
import { TableColumn } from "../types";
import { X, Save, AlertCircle } from "lucide-react";

interface RowEditModalProps {
  tableName: string;
  columns: TableColumn[];
  initialData: Record<string, any>;
  onClose: () => void;
  onSave: (record: Record<string, any>, pkCol: string, pkVal: any) => Promise<void>;
}

export const RowEditModal: React.FC<RowEditModalProps> = ({
  tableName,
  columns,
  initialData,
  onClose,
  onSave
}) => {
  const pkCol = columns.find((c) => c.pk === 1) || columns[0];
  const [formData, setFormData] = useState<Record<string, any>>({ ...initialData });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(formData, pkCol.name, initialData[pkCol.name]);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al actualizar registro");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-[#171717] border border-[#2e2e2e] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-[#262626] flex items-center justify-between bg-[#1f1f1f]">
          <div>
            <h3 className="font-bold text-white text-base">Editar Registro</h3>
            <p className="text-xs text-neutral-400 font-mono">Tabla: {tableName}</p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#141414] scrollbar-thin">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-lg text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {columns.map((c) => {
            const isPk = c.pk === 1;
            return (
              <div key={c.cid}>
                <label className="block text-xs font-medium text-neutral-300 mb-1 font-mono flex items-center justify-between">
                  <span>{c.name} {isPk && <span className="text-amber-400 font-sans text-[11px]">(Clave Primaria)</span>}</span>
                  <span className="text-[10px] text-neutral-500 uppercase">{c.type || "ANY"}</span>
                </label>
                {isPk ? (
                  <input
                    type="text"
                    disabled
                    value={formData[c.name] ?? ""}
                    className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#292929] rounded-lg text-xs font-mono text-neutral-500 cursor-not-allowed"
                  />
                ) : (
                  <textarea
                    rows={2}
                    value={formData[c.name] ?? ""}
                    onChange={(e) => setFormData({ ...formData, [c.name]: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg text-xs font-mono text-neutral-100 focus:outline-none focus:border-[#3ecf8e] resize-y"
                  />
                )}
              </div>
            );
          })}

          <div className="pt-2 flex justify-end gap-2 border-t border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#202020] hover:bg-[#282828] text-neutral-300 rounded-lg text-xs font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-semibold rounded-lg text-xs shadow transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
