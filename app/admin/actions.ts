"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseStringList, validateFilterPayload, validateProductPayload } from "@/lib/catalog/validation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerActionClient, createServerComponentClient } from "@/lib/supabase/server";

type SupabaseAdminClient = NonNullable<Awaited<ReturnType<typeof createServerActionClient>>>;

async function requireAdminClient(): Promise<SupabaseAdminClient> {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=missing_supabase");
  }

  const supabase = await createServerActionClient();

  if (!supabase) {
    redirect("/login?error=missing_supabase");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?error=unauthorized");
  }

  return supabase as SupabaseAdminClient;
}

async function getAdminClientForRead(): Promise<SupabaseAdminClient | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createServerComponentClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return supabase as SupabaseAdminClient;
}

function parseAssignmentsFromForm(formData: FormData, fieldName = "filter_values") {
  const rawValues = formData.getAll(fieldName);

  return rawValues.flatMap((entry) => {
    const text = String(entry ?? "").trim();

    if (!text) {
      return [];
    }

    const [filtro_id, valor_filtro_id] = text.split(":");

    if (!filtro_id || !valor_filtro_id) {
      return [];
    }

    return [{ filtro_id, valor_filtro_id }];
  });
}

function parseStringArrayFromForm(formData: FormData, fieldName: string) {
  const value = String(formData.get(fieldName) ?? "");
  return parseStringList(value);
}

function cleanStorageFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase();
}

async function uploadProductImages(supabase: SupabaseAdminClient, productId: string, files: File[]) {
  const urls: string[] = [];

  for (const [index, file] of files.entries()) {
    const cleanedName = cleanStorageFileName(file.name || `foto-${index + 1}`);
    const extension = cleanedName.includes(".") ? "" : ".jpg";
    const storagePath = `products/${productId}/${Date.now()}-${index + 1}-${cleanedName}${extension}`;
    const uploaded = await supabase.storage.from("product-images").upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

    if (uploaded.error) {
      throw new Error(`No se pudo subir la imagen ${file.name}: ${uploaded.error.message}`);
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(storagePath);
    urls.push(data.publicUrl);
  }

  return urls;
}

async function cleanupProductStorage(supabase: SupabaseAdminClient, productId: string) {
  const folder = `products/${productId}`;
  const { data: files, error } = await supabase.storage.from("product-images").list(folder);

  if (error) {
    return;
  }

  const fileNames = files.map((item) => `${folder}/${item.name}`);

  if (fileNames.length > 0) {
    await supabase.storage.from("product-images").remove(fileNames);
  }
}

export async function logoutAction() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createServerActionClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}

export async function getAdminSession() {
  if (!isSupabaseConfigured()) {
    return { authenticated: false };
  }

  const supabase = await createServerComponentClient();

  if (!supabase) {
    return { authenticated: false };
  }

  const { data, error } = await supabase.auth.getUser();

  return {
    authenticated: !error && Boolean(data.user),
    user: data.user ? { email: data.user.email } : null,
  };
}

export async function listFilters() {
  const supabase = await getAdminClientForRead();

  if (!supabase) {
    return [];
  }

  const { data: rawFilters } = await supabase.from("filtros").select("id, nombre").order("nombre", { ascending: true });
  const { data: rawValues } = await supabase.from("valores_filtros").select("id, filtro_id, valor").order("valor", { ascending: true });

  return (rawFilters ?? []).map((filterItem) => ({
    ...filterItem,
    valores: (rawValues ?? []).filter((valueItem) => valueItem.filtro_id === filterItem.id),
  }));
}

export async function listProducts() {
  const supabase = await getAdminClientForRead();

  if (!supabase) {
    return [];
  }

  const { data: productos } = await supabase
    .from("productos")
    .select("id, nombre, descripcion, precio, creado_at")
    .order("creado_at", { ascending: false });

  const { data: fotografias } = await supabase.from("fotografias").select("id, producto_id, url_imagen").order("creado_at", { ascending: true });
  const { data: assignments } = await supabase.from("producto_valores_filtros").select("producto_id, filtro_id, valor_filtro_id");
  const { data: values } = await supabase.from("valores_filtros").select("id, filtro_id, valor");

  const valuesById = new Map((values ?? []).map((item) => [item.id, item]));
  const photoMap = new Map<string, Array<{ id: string; url_imagen: string }>>();

  for (const item of fotografias ?? []) {
    const key = String(item.producto_id);
    const current = photoMap.get(key) ?? [];
    current.push({ id: item.id, url_imagen: item.url_imagen });
    photoMap.set(key, current);
  }

  return (productos ?? []).map((producto) => {
    const relatedAssignments = (assignments ?? []).filter((assignment) => String(assignment.producto_id) === String(producto.id));

    return {
      ...producto,
      fotografias: photoMap.get(String(producto.id)) ?? [],
      filtros: relatedAssignments.map((assignment) => {
        const value = valuesById.get(String(assignment.valor_filtro_id));

        return {
          filtro_id: assignment.filtro_id,
          valor_filtro_id: assignment.valor_filtro_id,
          valor: value?.valor ?? "",
        };
      }),
    };
  });
}

export async function createFilterAction(formData: FormData) {
  const supabase = await requireAdminClient();
  const nombre = String(formData.get("nombre") ?? "");
  const valores = String(formData.get("valores") ?? "");
  const payload = validateFilterPayload({ nombre, valoresIniciales: valores });

  const { data: insertedFilter, error: insertFilterError } = await supabase
    .from("filtros")
    .insert({ nombre: payload.nombre })
    .select("id")
    .single();

  if (insertFilterError || !insertFilterError && !insertedFilter) {
    redirect("/admin?error=filter_error");
  }

  if (payload.valoresIniciales.length > 0) {
    const rows = payload.valoresIniciales.map((valor) => ({
      filtro_id: insertedFilter.id,
      valor,
    }));

    const { error: valuesError } = await supabase.from("valores_filtros").insert(rows);

    if (valuesError) {
      redirect("/admin?error=filter_value_error");
    }
  }

  revalidatePath("/admin");
  redirect("/admin?success=filter_created");
}

export async function updateFilterAction(formData: FormData) {
  const supabase = await requireAdminClient();
  const filtroId = String(formData.get("filtro_id") ?? "");
  const nuevoNombre = String(formData.get("nombre") ?? "");
  const nuevosValores = parseStringArrayFromForm(formData, "nuevos_valores");
  const valoresAEliminar = parseStringArrayFromForm(formData, "valores_a_eliminar");

  if (!filtroId) {
    redirect("/admin?error=missing_filter");
  }

  if (nuevoNombre.trim()) {
    const { error } = await supabase.from("filtros").update({ nombre: nuevoNombre.trim() }).eq("id", filtroId);

    if (error) {
      redirect("/admin?error=filter_update_error");
    }
  }

  if (nuevosValores.length > 0) {
    const rows = nuevosValores.map((valor) => ({ filtro_id: filtroId, valor }));
    const { error: insertError } = await supabase.from("valores_filtros").upsert(rows, { onConflict: "filtro_id,valor" });

    if (insertError) {
      redirect("/admin?error=filter_value_error");
    }
  }

  if (valoresAEliminar.length > 0) {
    const { error: deleteError } = await supabase.from("valores_filtros").delete().in("id", valoresAEliminar);

    if (deleteError) {
      redirect("/admin?error=filter_delete_value_error");
    }
  }

  revalidatePath("/admin");
  redirect("/admin?success=filter_updated");
}

export async function deleteFilterAction(formData: FormData) {
  const supabase = await requireAdminClient();
  const filtroId = String(formData.get("filtro_id") ?? "");

  if (!filtroId) {
    redirect("/admin?error=missing_filter");
  }

  const { error } = await supabase.from("filtros").delete().eq("id", filtroId);

  if (error) {
    redirect("/admin?error=filter_delete_error");
  }

  revalidatePath("/admin");
  redirect("/admin?success=filter_deleted");
}

export async function createProductAction(formData: FormData) {
  const supabase = await requireAdminClient();
  const nombre = String(formData.get("nombre") ?? "");
  const descripcion = String(formData.get("descripcion") ?? "");
  const precioRaw = String(formData.get("precio") ?? "");
  const files: File[] = Array.from(formData.getAll("images")).filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const filters: Array<{ filtro_id: string; valor_filtro_id: string }> = parseAssignmentsFromForm(formData, "filter_values");

  try {
    const payload = validateProductPayload({
      nombre,
      descripcion,
      precio: precioRaw === "" ? null : precioRaw,
      images: files as Array<string | File>,
      filters,
    });

    const { data: product, error: productError } = await supabase
      .from("productos")
      .insert({
        nombre: payload.nombre,
        descripcion: payload.descripcion || null,
        precio: payload.precio,
      })
      .select("id")
      .single();

    if (productError || !product) {
      redirect("/admin?error=product_create_error");
    }

    const uploadedUrls = await uploadProductImages(supabase, product.id, files);

    if (uploadedUrls.length > 0) {
      const photoRows = uploadedUrls.map((url) => ({
        producto_id: product.id,
        url_imagen: url,
      }));

      const { error: photoError } = await supabase.from("fotografias").insert(photoRows);

      if (photoError) {
        redirect("/admin?error=photo_create_error");
      }
    }

    if (payload.filters.length > 0) {
      const filterRows = payload.filters.map((assignment) => ({
        producto_id: product.id,
        filtro_id: assignment.filtro_id,
        valor_filtro_id: assignment.valor_filtro_id,
      }));

      const { error: assignmentError } = await supabase.from("producto_valores_filtros").insert(filterRows);

      if (assignmentError) {
        redirect("/admin?error=filter_assignment_error");
      }
    }

    revalidatePath("/admin");
    redirect("/admin?success=product_created");
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el producto.";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }
}

export async function updateProductAction(formData: FormData) {
  const supabase = await requireAdminClient();
  const productoId = String(formData.get("producto_id") ?? "");
  const nombre = String(formData.get("nombre") ?? "");
  const descripcion = String(formData.get("descripcion") ?? "");
  const precioRaw = String(formData.get("precio") ?? "");
  const newFiles: File[] = Array.from(formData.getAll("images")).filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const existingImages = Array.from(formData.getAll("existing_images")).map((entry) => String(entry ?? "")).filter(Boolean);
  const removePhotoIds = Array.from(formData.getAll("remove_photo_ids")).map((entry) => String(entry ?? "")).filter(Boolean);
  const filters: Array<{ filtro_id: string; valor_filtro_id: string }> = parseAssignmentsFromForm(formData, "filter_values");

  if (!productoId) {
    redirect("/admin?error=missing_product");
  }

  try {
    const productImages: Array<string | File> = [...existingImages, ...newFiles];
    const payload = validateProductPayload({
      nombre,
      descripcion,
      precio: precioRaw === "" ? null : precioRaw,
      images: productImages,
      filters,
    });

    const { error: updateError } = await supabase
      .from("productos")
      .update({
        nombre: payload.nombre,
        descripcion: payload.descripcion || null,
        precio: payload.precio,
      })
      .eq("id", productoId);

    if (updateError) {
      redirect("/admin?error=product_update_error");
    }

    if (removePhotoIds.length > 0) {
      const { data: photoRows, error: photoReadError } = await supabase
        .from("fotografias")
        .select("id, url_imagen")
        .eq("producto_id", productoId);

      if (!photoReadError && photoRows) {
        const toDelete = photoRows.filter((row) => removePhotoIds.includes(String(row.id)));

        if (toDelete.length > 0) {
          const filePaths = toDelete
            .map((row) => row.url_imagen)
            .map((url) => {
              const pathname = decodeURIComponent(new URL(url).pathname);
              const match = pathname.match(/product-images\/(.*)$/);
              return match ? `${match[1]}` : null;
            })
            .filter((path): path is string => Boolean(path));

          if (filePaths.length > 0) {
            await supabase.storage.from("product-images").remove(filePaths);
          }

          await supabase.from("fotografias").delete().in("id", toDelete.map((row) => row.id));
        }
      }
    }

    if (newFiles.length > 0) {
      const uploadedUrls = await uploadProductImages(supabase, productoId, newFiles);
      const photoRows = uploadedUrls.map((url) => ({ producto_id: productoId, url_imagen: url }));
      const { error: photoError } = await supabase.from("fotografias").insert(photoRows);

      if (photoError) {
        redirect("/admin?error=photo_update_error");
      }
    }

    const { error: clearAssignmentsError } = await supabase.from("producto_valores_filtros").delete().eq("producto_id", productoId);

    if (clearAssignmentsError) {
      redirect("/admin?error=filter_assignment_error");
    }

    if (payload.filters.length > 0) {
      const rows = payload.filters.map((assignment) => ({
        producto_id: productoId,
        filtro_id: assignment.filtro_id,
        valor_filtro_id: assignment.valor_filtro_id,
      }));

      const { error: assignmentError } = await supabase.from("producto_valores_filtros").insert(rows);

      if (assignmentError) {
        redirect("/admin?error=filter_assignment_error");
      }
    }

    revalidatePath("/admin");
    redirect("/admin?success=product_updated");
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el producto.";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }
}

export async function deleteProductAction(formData: FormData) {
  const supabase = await requireAdminClient();
  const productoId = String(formData.get("producto_id") ?? "");

  if (!productoId) {
    redirect("/admin?error=missing_product");
  }

  await cleanupProductStorage(supabase, productoId);

  const { error } = await supabase.from("productos").delete().eq("id", productoId);

  if (error) {
    redirect("/admin?error=product_delete_error");
  }

  revalidatePath("/admin");
  redirect("/admin?success=product_deleted");
}
