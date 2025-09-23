from pathlib import Path
path = Path(r"lib/datasources/sale.datasource.ts")
text = path.read_text(encoding="utf-8")
old_imports = "import { BaseDatasource } from './base.datasource';\nimport { prisma } from '@/lib/prisma';\n\n\n\n"
new_imports = (
    "import { BaseDatasource } from './base.datasource';\n"
    "import { prisma } from '@/lib/prisma';\n"
    "import type { Prisma } from '@prisma/client';\n"
    "import { SaleStatus } from '@prisma/client';\n"
    "import type { InvoiceFilters } from '@/lib/types/invoices';\n\n"
    "type SaleWithRelations = Awaited<ReturnType<typeof prisma.sale.findMany>> extends Array<infer T> ? T : never;\n\n"
)
if old_imports not in text:
    raise SystemExit('Expected import block not found')
text = text.replace(old_imports, new_imports, 1)
needle = "  /**\r\n * Busca ventas por coincidencia parcial en saleNumber, ruc o nombre del cliente\r\n */"
if needle not in text:
    raise SystemExit('Needle not found for insertion point')
new_methods = "  async getInvoicesWithFilters(\n    filters: InvoiceFilters = {},\n    limit = 50,\n    offset = 0,\n  ): Promise<{ sales: SaleWithRelations[]; totalCount: number }> {\n    const {\n      cashierId,\n      statuses,\n      dateFrom,\n      dateTo,\n      minTotal,\n      maxTotal,\n      search,\n    } = filters;\n\n    const conditions: Prisma.SaleWhereInput[] = [\n      { deletedAt: null },\n    ];\n\n    if (cashierId) {\n      conditions.push({ userId: cashierId });\n    }\n\n    if (Array.isArray(statuses) && statuses.length > 0) {\n      const prismaStatuses = (Object.values(SaleStatus) as string[])\n        .filter(Boolean);\n      const normalizedStatuses = statuses\n        .filter((status): status is string => typeof status === 'string' && prismaStatuses.includes(status))\n        .map((status) => status as SaleStatus);\n\n      if (normalizedStatuses.length > 0) {\n        conditions.push({ status: { in: normalizedStatuses } });\n      }\n    }\n\n    const fromDate = dateFrom ? new Date(dateFrom) : undefined;\n    const toDate = dateTo ? new Date(dateTo) : undefined;\n    if (toDate) {\n      toDate.setHours(23, 59, 59, 999);\n    }\n\n    if (fromDate || toDate) {\n      const range: Prisma.DateTimeFilter = {};\n      if (fromDate) {\n        range.gte = fromDate;\n      }\n      if (toDate) {\n        range.lte = toDate;\n      }\n      conditions.push({ createdAt: range });\n    }\n\n    const min = typeof minTotal === 'number' && not math.isnan? ...
