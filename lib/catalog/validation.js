/**
 * @typedef {{ filtro_id: string, valor_filtro_id: string }} FilterAssignment
 */

export function ensureRequiredText(value, fieldName) {
  const cleaned = String(value ?? "").trim();

  if (!cleaned) {
    throw new Error(`${fieldName} es obligatorio.`);
  }

  return cleaned;
}

/**
 * @param {string | string[] | null | undefined} value
 * @returns {string[]}
 */
export function parseStringList(value) {
  if (value === null || value === undefined || value === "") {
    return [];
  }

  return String(value)
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * @param {Array<FilterAssignment> | undefined} filters
 * @returns {Array<FilterAssignment>}
 */
export function normalizeFilterAssignments(filters = []) {
  const assignments = Array.isArray(filters) ? filters : [];
  const seen = new Set();

  return assignments.map((assignment) => {
    const filtroId = String(assignment?.filtro_id ?? "").trim();
    const valorId = String(assignment?.valor_filtro_id ?? "").trim();

    if (!filtroId || !valorId) {
      throw new Error("Cada asociación de filtro debe incluir filtro y valor.");
    }

    if (seen.has(filtroId)) {
      throw new Error("Un producto no puede tener más de un valor por filtro.");
    }

    seen.add(filtroId);

    return { filtro_id: filtroId, valor_filtro_id: valorId };
  });
}

/**
 * @param {{ nombre: string, valoresIniciales?: string | string[] }} payload
 * @returns {{ nombre: string, valoresIniciales: string[] }}
 */
export function validateFilterPayload({ nombre, valoresIniciales = [] }) {
  const normalizedName = ensureRequiredText(nombre, "El nombre del filtro");
  const values = parseStringList(valoresIniciales)
    .map((value) => value.trim())
    .filter(Boolean);

  if (values.length === 0) {
    return {
      nombre: normalizedName,
      valoresIniciales: [],
    };
  }

  return {
    nombre: normalizedName,
    valoresIniciales: [...new Set(values)],
  };
}

/**
 * @param {{ nombre: string, descripcion?: string, precio?: string | number | null, images?: Array<string | File>, filters?: Array<FilterAssignment> }} payload
 * @returns {{ nombre: string, descripcion: string, precio: number | null, filters: Array<FilterAssignment> }}
 */
export function validateProductPayload({ nombre, descripcion = "", precio = null, images = [], filters = [] }) {
  const normalizedName = ensureRequiredText(nombre, "El nombre del producto");
  const cleanedDescription = typeof descripcion === "string" ? descripcion.trim() : "";
  const normalizedPrice = precio === null || precio === undefined || precio === "" ? null : Number(precio);

  if (Number.isNaN(normalizedPrice) && normalizedPrice !== null) {
    throw new Error("El precio debe ser un número válido.");
  }

  if (Array.isArray(images) && images.length === 0) {
    throw new Error("El producto debe contener al menos una fotografía.");
  }

  return {
    nombre: normalizedName,
    descripcion: cleanedDescription,
    precio: normalizedPrice,
    filters: normalizeFilterAssignments(filters),
  };
}
