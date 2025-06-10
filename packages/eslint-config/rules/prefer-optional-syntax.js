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
    // Helper function to recursively fix function parameters in nested function types
    function fixFunctionParametersRecursively(node, sourceCode) {
      if (node.type === "TSFunctionType") {
        // Fix parameters at this level
        const newParams = node.params?.map(param => {
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
              // Recursively process the parameter type in case it's also a function
              const singleType = nonUndefinedTypes[0];
              if (singleType.type === "TSFunctionType") {
                newParamType = fixFunctionParametersRecursively(singleType, sourceCode);
              } else if (singleType.type === "TSParenthesizedType" && singleType.typeAnnotation?.type === "TSFunctionType") {
                newParamType = `(${fixFunctionParametersRecursively(singleType.typeAnnotation, sourceCode)})`;
              } else {
                newParamType = sourceCode.getText(singleType);
              }
            } else {
              newParamType = nonUndefinedTypes
                .map(type => {
                  if (type.type === "TSFunctionType") {
                    return fixFunctionParametersRecursively(type, sourceCode);
                  } else if (type.type === "TSParenthesizedType" && type.typeAnnotation?.type === "TSFunctionType") {
                    return `(${fixFunctionParametersRecursively(type.typeAnnotation, sourceCode)})`;
                  } else {
                    return sourceCode.getText(type);
                  }
                })
                .join(" | ");
            }

            const paramName = sourceCode.getText(param);
            const colonIndex = paramName.indexOf(':');
            const baseParamName = paramName.substring(0, colonIndex);
            return `${baseParamName}?: ${newParamType}`;
          }
          
          return sourceCode.getText(param);
        }).join(", ") || "";

        // Recursively fix return type if it's also a function
        let returnTypeText;
        if (node.returnType?.typeAnnotation?.type === "TSFunctionType") {
          returnTypeText = fixFunctionParametersRecursively(node.returnType.typeAnnotation, sourceCode);
        } else {
          returnTypeText = node.returnType ? 
            sourceCode.getText(node.returnType.typeAnnotation) : "void";
        }

        return `(${newParams}) => ${returnTypeText}`;
      }
      
      return sourceCode.getText(node);
    }

    // Helper function to check if a function type (possibly nested) has union parameters
    function hasUnionParamsRecursively(node) {
      if (node.type === "TSFunctionType") {
        const hasDirectUnionParams = node.params?.some(param => {
          const paramTypeAnnotation = param.typeAnnotation?.typeAnnotation;
          if (paramTypeAnnotation?.type === "TSUnionType" &&
            paramTypeAnnotation.types.some(
              type =>
                (type.type === "TSUndefinedKeyword") ||
                (type.type === "TSLiteralType" && type.literal.value === undefined)
            )) {
            return true;
          }
          
          // Also check if parameter type itself contains nested function types with unions
          if (paramTypeAnnotation?.type === "TSFunctionType") {
            return hasUnionParamsRecursively(paramTypeAnnotation);
          } else if (paramTypeAnnotation?.type === "TSParenthesizedType" && 
                     paramTypeAnnotation.typeAnnotation?.type === "TSFunctionType") {
            return hasUnionParamsRecursively(paramTypeAnnotation.typeAnnotation);
          } else if (paramTypeAnnotation?.type === "TSUnionType") {
            return paramTypeAnnotation.types.some(type => {
              if (type.type === "TSFunctionType") {
                return hasUnionParamsRecursively(type);
              } else if (type.type === "TSParenthesizedType" && type.typeAnnotation?.type === "TSFunctionType") {
                return hasUnionParamsRecursively(type.typeAnnotation);
              }
              return false;
            });
          }
          
          return false;
        });

        const hasNestedUnionParams = node.returnType?.typeAnnotation?.type === "TSFunctionType" &&
          hasUnionParamsRecursively(node.returnType.typeAnnotation);

        return hasDirectUnionParams || hasNestedUnionParams;
      }
      return false;
    }

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
              const sourceCode = context.getSourceCode();
              const propertyName = sourceCode.getText(node.key);

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
                newType = sourceCode.getText(nonUndefinedTypes[0]);
                
                // Check if this single type is a function type that needs parameter fixing
                const singleType = nonUndefinedTypes[0];
                if (singleType.type === "TSFunctionType" || 
                    (singleType.type === "TSParenthesizedType" && singleType.typeAnnotation?.type === "TSFunctionType")) {
                  
                  const funcType = singleType.type === "TSParenthesizedType" ? 
                    singleType.typeAnnotation : singleType;
                  
                  // Check if function has parameters with unions containing undefined
                  const hasUnionParams = funcType.params?.some(param => {
                    const paramTypeAnnotation = param.typeAnnotation?.typeAnnotation;
                    return paramTypeAnnotation?.type === "TSUnionType" &&
                      paramTypeAnnotation.types.some(
                        type =>
                          (type.type === "TSUndefinedKeyword") ||
                          (type.type === "TSLiteralType" && type.literal.value === undefined)
                      );
                  });

                  if (hasUnionParams) {
                    // Build new function parameters with optional syntax
                    const newParams = funcType.params.map(param => {
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
                    const returnType = funcType.returnType ? 
                      sourceCode.getText(funcType.returnType.typeAnnotation) : "void";

                    newType = `(${newParams}) => ${returnType}`;
                  }
                }
              } else {
                newType = nonUndefinedTypes
                  .map(type => sourceCode.getText(type))
                  .join(" | ");
              }

              // Build the fixed property with the optional syntax, preserving readonly
              const readonlyPrefix = node.readonly ? "readonly " : "";
              const fixed = `${readonlyPrefix}${propertyName}?: ${newType}`;

              // Replace the entire property signature
              return fixer.replaceText(node, fixed);
            }
          });
        }

        // Also handle function parameters within property signatures (including nested)
        if (typeAnnotation?.type === "TSFunctionType") {
          const hasUnionParams = hasUnionParamsRecursively(typeAnnotation);

          if (hasUnionParams) {
            context.report({
              node,
              message: "Use optional property syntax (prop?: type) instead of union with undefined",
              fix(fixer) {
                const sourceCode = context.getSourceCode();
                const propertyName = sourceCode.getText(node.key);
                
                // Use recursive helper to fix all nested function parameters
                const fixedFunctionType = fixFunctionParametersRecursively(typeAnnotation, sourceCode);

                // Build the fixed property with the optional syntax, preserving readonly
                const readonlyPrefix = node.readonly ? "readonly " : "";
                const fixed = `${readonlyPrefix}${propertyName}: ${fixedFunctionType}`;

                // Replace the entire property signature
                return fixer.replaceText(node, fixed);
              }
            });
          }
        }
      },
      TSMethodSignature(node) {
        // Handle method parameters with union types containing undefined
        const hasUnionParams = node.params?.some(param => {
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
              const methodName = sourceCode.getText(node.key);
              
              // Build new method parameters with optional syntax
              const newParams = node.params.map(param => {
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
              const returnType = node.returnType ? 
                sourceCode.getText(node.returnType.typeAnnotation) : "void";

              // Build the fixed method signature, preserving readonly
              const readonlyPrefix = node.readonly ? "readonly " : "";
              const fixed = `${readonlyPrefix}${methodName}(${newParams}): ${returnType}`;

              // Replace the entire method signature
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
           node.parent.type === "Parameter") &&
          // Avoid double-reporting when this is part of a function parameter within a property signature
          !(node.parent.parent?.type === "TSFunctionType" && 
            node.parent.parent.parent?.type === "TSTypeAnnotation" &&
            node.parent.parent.parent.parent?.type === "TSPropertySignature") &&
          // Also avoid when it's part of a parenthesized function type in a union
          !(node.parent.parent?.type === "TSFunctionType" && 
            node.parent.parent.parent?.type === "TSParenthesizedType" &&
            node.parent.parent.parent.parent?.type === "TSUnionType" &&
            node.parent.parent.parent.parent.parent?.type === "TSTypeAnnotation" &&
            node.parent.parent.parent.parent.parent.parent?.type === "TSPropertySignature") &&
          // Avoid double-reporting when this is part of a method parameter
          !(node.parent.parent?.type === "TSMethodSignature") &&
          // Avoid double-reporting when this is part of a nested function parameter in return type
          !(node.parent.parent?.type === "TSFunctionType" && 
            node.parent.parent.parent?.type === "TSTypeAnnotation" &&
            node.parent.parent.parent.parent?.type === "TSFunctionType" &&
            node.parent.parent.parent.parent.parent?.type === "TSTypeAnnotation" &&
            node.parent.parent.parent.parent.parent.parent?.type === "TSPropertySignature")
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
