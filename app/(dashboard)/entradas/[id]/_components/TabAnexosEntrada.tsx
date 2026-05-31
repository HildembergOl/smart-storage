"use client";

export interface Anexo {
  id: string;
  url: string;
  description?: string | null;
}

interface TabAnexosEntradaProps {
  anexos: Anexo[];
  setAnexos: React.Dispatch<React.SetStateAction<Anexo[]>>;
}

export function TabAnexosEntrada({ anexos, setAnexos }: TabAnexosEntradaProps) {
  console.log(anexos, setAnexos);
  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-sky-500/50 transition-colors cursor-pointer"
        id="ent-file-upload"
      >
        <p className="text-slate-400 text-sm">Clique para anexar um arquivo</p>
        <p className="text-slate-500 text-xs mt-1">PDF, XML, imagens</p>
      </div>
      <p className="text-slate-500 text-sm text-center py-4">
        Nenhum anexo adicionado.
      </p>
    </div>
  );
}
