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

        // Also handle function parameters within property signatures
        if (typeAnnotation?.type === "TSFunctionType") {
          const hasUnionParams = typeAnnotation.params?.some(param => {
            const paramTypeAnnotation = param.typeAnnotation?.typeAnnotation;
            return paramTypeAnnotation?.type === "TSUnionType" &&
              paramTypeAnnotation.types.some(
                type =>
                  (type.type === "TSUndefinedKeyword") ||
                  (type.type === "TSLiteralType" && type.literal.value === undefined)
              );
          });

          if (hasUnionParams) {
            context.report({
              node,
              message: "Use optional property syntax (prop?: type) instead of union with undefined",
              fix(fixer) {
                const sourceCode = context.getSourceCode();
                const propertyName = sourceCode.getText(node.key);
                
                // Build new function parameters
                const newParams = typeAnnotation.params.map(param => {
                  const paramTypeAnnotation = param.typeAnnotation?.typeAnnotation;
                  
                  if (
                    paramTypeAnnotation?.type === "TSUnionType" &&
                    paramTypeAnnotation.types.some(
                      type =>
                        (type.type === "TSUndefinedKeyword") ||
                        (type.type === "TSLiteralType" && type.literal.value === undefined)
                    )
                  ) {
                    // Convert union with undefined to optional parameter
                    const nonUndefinedTypes = paramTypeAnnotation.types.filter(
                      type =>
                        type.type !== "TSUndefinedKeyword" &&
                        !(type.type === "TSLiteralType" && type.literal.value === undefined)
                    );

                    let newParamType;
                    if (nonUndefinedTypes.length === 1) {
                      newParamType = sourceCode.getText(nonUndefinedTypes[0]);
                    } else {
                      newParamType = nonUndefinedTypes
                        .map(type => sourceCode.getText(type))
                        .join(" | ");
                    }

                    const paramName = sourceCode.getText(param);
                    const colonIndex = paramName.indexOf(':');
                    const baseParamName = paramName.substring(0, colonIndex);
                    return `${baseParamName}?: ${newParamType}`;
                  }
                  
                  return sourceCode.getText(param);
                }).join(", ");

                // Build the return type
                const returnType = typeAnnotation.returnType ? 
                  sourceCode.getText(typeAnnotation.returnType.typeAnnotation) : "void";

                // Build the fixed property with the optional syntax
                const fixed = `${propertyName}: (${newParams}) => ${returnType}`;

                // Replace the entire property signature
                return fixer.replaceText(node, fixed);
              }
            });
          }
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
           node.parent.type === "Parameter") &&
          // Avoid double-reporting when this is part of a function parameter within a property signature
          !(node.parent.parent?.type === "TSFunctionType" && 
            node.parent.parent.parent?.type === "TSTypeAnnotation" &&
            node.parent.parent.parent.parent?.type === "TSPropertySignature")
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
