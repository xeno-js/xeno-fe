import type { Optional } from "@xeno-js/shared"
import type { ZodType } from "zod"

export interface PipelineConfig {
    queryCaching: boolean
    threshold: number
    schemas: Optional<Record<string, ZodType>>
}