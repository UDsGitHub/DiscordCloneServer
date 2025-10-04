// ...existing code...
export abstract class BaseUseCase<I extends any[] = [], O = unknown, P = unknown> {
  /**
   * Execute the use case: runs handle(...) then presents the result.
   * Children must implement handle(). They may override present() for custom output.
   */
  async execute(...input: I): Promise<P> {
    const result = await this.handle(...input);
    return this.present(result);
  }

  /** Main use-case logic to implement in subclasses. */
  protected abstract handle(...input: I): Promise<O> | O;

  /**
   * Default presenter:
   * - returns strings unchanged
   * - converts numbers/booleans to strings
   * - formats Errors to a simple object
   * - Buffers -> base64
   * - Arrays -> maps items through present (shallow)
   * - Objects with toJSON -> uses toJSON
   * - otherwise JSON.stringify
   *
   * Override in child when you need a different response shape.
   */
  protected present(response: O): P {
    if (response == null) return null as unknown as P;

    // primitives
    if (typeof response === "string") return response as unknown as P;
    if (typeof response === "number" || typeof response === "boolean") {
      return String(response) as unknown as P;
    }

    // Error
    if (response instanceof Error) {
      return { error: response.message, name: response.name } as unknown as P;
    }

    // Buffer (Node)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyResp = response as any;
    if (typeof Buffer !== "undefined" && Buffer.isBuffer(anyResp)) {
      return anyResp.toString("base64") as unknown as P;
    }

    // Array -> present each item (shallow)
    if (Array.isArray(anyResp)) {
      return anyResp.map((item: unknown) =>
        this.present(item as unknown as O)
      ) as unknown as P;
    }

    // Objects with toJSON
    if (anyResp && typeof anyResp.toJSON === "function") {
      return anyResp.toJSON() as unknown as P;
    }

    // Fallback -> JSON
    try {
      return JSON.parse(JSON.stringify(anyResp)) as unknown as P;
    } catch {
      return String(anyResp) as unknown as P;
    }
  }
}