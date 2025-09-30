import * as fs from "fs";
import * as path from "path";

/**
 * Simple template engine for loading and processing HTML templates
 */
export class TemplateEngine {
  private templateCache: Map<string, string> = new Map();

  constructor(private templateDir: string) {}

  /**
   * Load a template file
   */
  private loadTemplate(filename: string): string {
    if (this.templateCache.has(filename)) {
      return this.templateCache.get(filename)!;
    }

    const templatePath = path.join(this.templateDir, filename);
    const content = fs.readFileSync(templatePath, "utf8");
    this.templateCache.set(filename, content);
    return content;
  }

  /**
   * Render a template with variables
   */
  render(templateName: string, variables: Record<string, any>): string {
    let template = this.loadTemplate(templateName);

    // Replace all {{variableName}} with actual values
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      template = template.replace(regex, String(value ?? ""));
    }

    return template;
  }

  /**
   * Clear template cache (useful for development)
   */
  clearCache(): void {
    this.templateCache.clear();
  }
}
