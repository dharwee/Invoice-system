-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "file_path" TEXT NOT NULL,
    "raw_text" TEXT,
    "processing_time_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracted_data" (
    "id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "vendor_name" TEXT,
    "invoice_number" TEXT,
    "invoice_date" TEXT,
    "currency" TEXT,
    "total_amount" DOUBLE PRECISION,
    "tax_amount" DOUBLE PRECISION,
    "confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "validation_errors" JSONB NOT NULL DEFAULT '[]',
    "prompt_version_id" INTEGER,

    CONSTRAINT "extracted_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "line_items" (
    "id" SERIAL NOT NULL,
    "extracted_data_id" INTEGER NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION,
    "unit_price" DOUBLE PRECISION,
    "line_total" DOUBLE PRECISION,

    CONSTRAINT "line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_versions" (
    "id" SERIAL NOT NULL,
    "version" TEXT NOT NULL,
    "prompt_text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "extracted_data_document_id_key" ON "extracted_data"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_versions_version_key" ON "prompt_versions"("version");

-- AddForeignKey
ALTER TABLE "extracted_data" ADD CONSTRAINT "extracted_data_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_data" ADD CONSTRAINT "extracted_data_prompt_version_id_fkey" FOREIGN KEY ("prompt_version_id") REFERENCES "prompt_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_extracted_data_id_fkey" FOREIGN KEY ("extracted_data_id") REFERENCES "extracted_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;
