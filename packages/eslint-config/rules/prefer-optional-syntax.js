/**
 * Rule to enforce using the optional property syntax (prop?: type) instead of union with undefined (prop: type | undefined)
 */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce using the optional property syntax (prop?: type) instead of union with undefined (prop: type | undefined)",
      category: "TypeScript",
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },
  create(context) {
    return {
      TSPropertySignature(node) {
        // Check if the type annotation is a union type that includes undefined
        const typeAnnotation = node.typeAnnotation?.typeAnnotation;
        if (
          typeAnnotation?.type === "TSUnionType" &&
          typeAnnotation.types.some(
            type =>
              (type.type === "TSUndefinedKeyword") ||
              (type.type === "TSLiteralType" && type.literal.value === undefined)
          )
        ) {
          context.report({
            node,
            message: "Use optional property syntax (prop?: type) instead of union with undefined",
            fix(fixer) {
              // Get property name
              const propertyName = context.getSourceCode().getText(node.key);

              // Create new optional property with the non-undefined types from the union
              const nonUndefinedTypes = typeAnnotation.types.filter(
                type =>
                  type.type !== "TSUndefinedKeyword" &&
                  !(type.type === "TSLiteralType" && type.literal.value === undefined)
              );

              // If there's only one type left, use it directly
              // If there are multiple types, keep them as a union
              let newType;
              if (nonUndefinedTypes.length === 1) {
                newType = context.getSourceCode().getText(nonUndefinedTypes[0]);
              } else {
                newType = nonUndefinedTypes
                  .map(type => context.getSourceCode().getText(type))
                  .join(" | ");
              }

              // Build the fixed property with the optional syntax
              const fixed = `${propertyName}?: ${newType}`;

              // Replace the entire property signature
              return fixer.replaceText(node, fixed);
            }
          });
        }
      },
      // Also check for variable and parameter declarations
      TSTypeAnnotation(node) {
        const typeAnnotation = node.typeAnnotation;

        if (
          typeAnnotation?.type === "TSUnionType" &&
          typeAnnotation.types.some(
            type =>
              (type.type === "TSUndefinedKeyword") ||
              (type.type === "TSLiteralType" && type.literal.value === undefined)
          ) &&
          // Only target variable and parameter declarations, not return types
          (node.parent.type === "Identifier" ||
           node.parent.type === "Parameter")
        ) {
          context.report({
            node: node.parent,
            message: "Consider using optional syntax (prop?: type) instead of union with undefined",
          });
        }
      }
    };
  },
}
