CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(12, 2),
    creado_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fotografias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    creado_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS filtros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    creado_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS valores_filtros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filtro_id UUID NOT NULL REFERENCES filtros(id) ON DELETE CASCADE,
    valor VARCHAR(100) NOT NULL,
    creado_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_unico_por_filtro UNIQUE (filtro_id, valor)
);

CREATE TABLE IF NOT EXISTS producto_valores_filtros (
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    filtro_id UUID NOT NULL REFERENCES filtros(id) ON DELETE CASCADE,
    valor_filtro_id UUID NOT NULL REFERENCES valores_filtros(id) ON DELETE CASCADE,
    creado_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (producto_id, filtro_id)
);

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotografias ENABLE ROW LEVEL SECURITY;
ALTER TABLE filtros ENABLE ROW LEVEL SECURITY;
ALTER TABLE valores_filtros ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_valores_filtros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read products" ON productos FOR SELECT USING (true);
CREATE POLICY "Authenticated admin can manage products" ON productos FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public can read photos" ON fotografias FOR SELECT USING (true);
CREATE POLICY "Authenticated admin can manage photos" ON fotografias FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public can read filters" ON filtros FOR SELECT USING (true);
CREATE POLICY "Authenticated admin can manage filters" ON filtros FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public can read filter values" ON valores_filtros FOR SELECT USING (true);
CREATE POLICY "Authenticated admin can manage filter values" ON valores_filtros FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public can read product filter values" ON producto_valores_filtros FOR SELECT USING (true);
CREATE POLICY "Authenticated admin can manage product filter values" ON producto_valores_filtros FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated admin can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated') WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated admin can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
