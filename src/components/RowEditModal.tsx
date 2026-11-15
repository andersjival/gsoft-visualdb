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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Editar Registro</h3>
            <p className="text-xs text-slate-400 font-mono">Tabla: {tableName}</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
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
                <label className="block text-xs font-medium text-slate-300 mb-1 font-mono flex items-center justify-between">
                  <span>{c.name} {isPk && <span className="text-amber-400 font-sans text-[11px]">(Clave Primaria)</span>}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{c.type || "ANY"}</span>
                </label>
                {isPk ? (
                  <input
                    type="text"
                    disabled
                    value={formData[c.name] ?? ""}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 cursor-not-allowed"
                  />
                ) : (
                  <textarea
                    rows={2}
                    value={formData[c.name] ?? ""}
                    onChange={(e) => setFormData({ ...formData, [c.name]: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 resize-y"
                  />
                )}
              </div>
            );
          })}

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow transition disabled:opacity-50"
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
