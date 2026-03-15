"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Package,
  Warehouse,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const monthlyData = [
  { mes: "Out", entradas: 42500, saidas: 38700 },
  { mes: "Nov", entradas: 55200, saidas: 48100 },
  { mes: "Dez", entradas: 78600, saidas: 65400 },
  { mes: "Jan", entradas: 45800, saidas: 42300 },
  { mes: "Fev", entradas: 62300, saidas: 57800 },
  { mes: "Mar", entradas: 58900, saidas: 49200 },
];

const categoryData = [
  { name: "Eletrônicos", value: 32 },
  { name: "Alimentos", value: 24 },
  { name: "Vestuário", value: 18 },
  { name: "Ferramentas", value: 14 },
  { name: "Outros", value: 12 },
];

const COLORS = ["#0EA5E9", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

const lowStockProducts = [
  {
    codigo: "PRD001",
    descricao: "Parafuso M8 Inox",
    estoque: "EE 01",
    quantidade: 12,
    minimo: 50,
  },
  {
    codigo: "PRD047",
    descricao: "Cabo USB-C 2m",
    estoque: "EE 02",
    quantidade: 5,
    minimo: 20,
  },
  {
    codigo: "PRD113",
    descricao: "Luva de Segurança P",
    estoque: "EE 01",
    quantidade: 3,
    minimo: 30,
  },
  {
    codigo: "PRD088",
    descricao: "Filtro de Ar Industrial",
    estoque: "EE 03",
    quantidade: 8,
    minimo: 15,
  },
];

const recentMovements = [
  {
    id: 1,
    tipo: "Entrada",
    documento: "NF-002341",
    pessoa: "Fornecedor ABC",
    estoque: "EE 01",
    qtd: 150,
    valor: "R$ 4.500,00",
    data: "14/03/2025",
  },
  {
    id: 2,
    tipo: "Saída",
    documento: "NF-001823",
    pessoa: "Empresa XYZ",
    estoque: "EE 02",
    qtd: 30,
    valor: "R$ 1.200,00",
    data: "14/03/2025",
  },
  {
    id: 3,
    tipo: "Entrada",
    documento: "MAN-0042",
    pessoa: "Distribuidora Norte",
    estoque: "EE 01",
    qtd: 200,
    valor: "R$ 8.000,00",
    data: "13/03/2025",
  },
  {
    id: 4,
    tipo: "Saída",
    documento: "NF-001824",
    pessoa: "Cliente Sul",
    estoque: "EE 03",
    qtd: 75,
    valor: "R$ 3.375,00",
    data: "13/03/2025",
  },
  {
    id: 5,
    tipo: "Entrada",
    documento: "NF-002342",
    pessoa: "Fornecedor Beta",
    estoque: "EE 02",
    qtd: 500,
    valor: "R$ 12.500,00",
    data: "12/03/2025",
  },
];

const kpis = [
  {
    title: "Total em Estoque",
    value: "R$ 2.847.390",
    change: "+12,3%",
    positive: true,
    icon: Warehouse,
    color: "from-sky-500/20 to-sky-600/10",
    iconColor: "text-sky-400",
    borderColor: "border-sky-500/20",
  },
  {
    title: "Produtos Cadastrados",
    value: "1.284",
    change: "+48 este mês",
    positive: true,
    icon: Package,
    color: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-400",
    borderColor: "border-purple-500/20",
  },
  {
    title: "Entradas do Mês",
    value: "R$ 58.900",
    change: "-5,5% vs anterior",
    positive: false,
    icon: TrendingUp,
    color: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/20",
  },
  {
    title: "Saídas do Mês",
    value: "R$ 49.200",
    change: "-14,9% vs anterior",
    positive: false,
    icon: TrendingDown,
    color: "from-orange-500/20 to-orange-600/10",
    iconColor: "text-orange-400",
    borderColor: "border-orange-500/20",
  },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((p, i) => (
          <p
            key={i}
            className="text-sm font-semibold"
            style={{ color: p.color }}
          >
            {p.name}:{" "}
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const now = new Date();
  const dateStr = format(now, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Olá, <span className="text-sky-400">Administrador</span> 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1 capitalize">{dateStr}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className={`bg-linear-to-br ${kpi.color} border ${kpi.borderColor} shadow-lg`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-medium">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {kpi.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight
                      className={`w-3.5 h-3.5 ${kpi.positive ? "text-emerald-400" : "text-red-400"} ${!kpi.positive ? "rotate-90" : ""}`}
                    />
                    <span
                      className={`text-xs font-medium ${kpi.positive ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-xl bg-slate-900/40`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <Card className="xl:col-span-2 bg-slate-800/40 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-200 text-base">
              Movimentação Mensal
            </CardTitle>
            <p className="text-slate-400 text-xs">
              Entradas vs Saídas — últimos 6 meses
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} barCategoryGap="30%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1E293B"
                  vertical={false}
                />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#94A3B8" }} />
                <Bar
                  dataKey="entradas"
                  name="Entradas"
                  fill="#0EA5E9"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="saidas"
                  name="Saídas"
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card className="bg-slate-800/40 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-200 text-base">
              Por Categoria
            </CardTitle>
            <p className="text-slate-400 text-xs">Distribuição de produtos</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#94A3B8" }}
                  itemStyle={{ color: "#E2E8F0" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {categoryData.map((cat, idx) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: COLORS[idx] }}
                    />
                    <span className="text-slate-400 text-xs">{cat.name}</span>
                  </div>
                  <span className="text-slate-300 text-xs font-medium">
                    {cat.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Low Stock Alert */}
        <Card className="xl:col-span-2 bg-slate-800/40 border-slate-700/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <CardTitle className="text-slate-200 text-base">
                Estoque Baixo
              </CardTitle>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                {lowStockProducts.length} alertas
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-4 py-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="text-right px-4 py-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Qtd
                  </th>
                  <th className="text-right px-4 py-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Mín
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr
                    key={p.codigo}
                    className="border-b border-slate-700/20 hover:bg-slate-700/20"
                  >
                    <td className="px-4 py-2.5">
                      <p className="text-slate-200 font-medium text-xs">
                        {p.descricao}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {p.codigo} · {p.estoque}
                      </p>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-red-400 font-bold text-sm">
                        {p.quantidade}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-slate-400 text-sm">{p.minimo}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card className="xl:col-span-3 bg-slate-800/40 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-200 text-base">
              Últimas Movimentações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-4 py-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="text-left px-4 py-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="text-left px-4 py-2 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                    Pessoa
                  </th>
                  <th className="text-right px-4 py-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-right px-4 py-2 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentMovements.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-slate-700/20 hover:bg-slate-700/20"
                  >
                    <td className="px-4 py-2.5">
                      <Badge
                        className={
                          m.tipo === "Entrada"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs"
                            : "bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs"
                        }
                      >
                        {m.tipo}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-slate-300 text-xs font-mono">
                      {m.documento}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400 text-xs hidden md:table-cell">
                      {m.pessoa}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-200 font-semibold text-xs">
                      {m.valor}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-500 text-xs hidden lg:table-cell">
                      {m.data}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
