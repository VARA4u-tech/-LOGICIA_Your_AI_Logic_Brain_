import re
from typing import Dict, Any, List
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application

def parse_math(expression_str: str) -> sp.Expr:
    """Parses a string into a SymPy expression safely."""
    transformations = (standard_transformations + (implicit_multiplication_application,))
    return parse_expr(expression_str, transformations=transformations)

def generate_graph_data(expr: sp.Expr, variable: sp.Symbol = sp.Symbol('x'), x_range: tuple = (-5, 5), steps: int = 20) -> List[Dict[str, float]]:
    """Generates basic plot data for an expression."""
    data = []
    if not expr.free_symbols or expr.free_symbols == {variable}:
        f = sp.lambdify(variable, expr, "math")
        step_size = (x_range[1] - x_range[0]) / steps
        for i in range(steps + 1):
            x_val = x_range[0] + i * step_size
            try:
                y_val = f(x_val)
                data.append({"x": x_val, "y": float(y_val)})
            except Exception:
                pass
    return data

def solve_math(input_text: str, mode: str) -> Dict[str, Any]:
    trimmed = input_text.strip().lower()

    response_data: Dict[str, Any] = {
        "content": "I couldn't quite understand that math problem. Could you try rephrasing it?\n\nExamples:\n• derivative of x^2\n• integrate x^2\n• solve x^2 - 4 = 0\n• 125 * 4",
        "solution": None
    }

    try:
        # 1. DERIVATIVE
        if "derivative" in trimmed or "d/dx" in trimmed or "differentiate" in trimmed:
            expr_str = re.sub(r'derivative\s*of|d/dx|differentiate', '', trimmed).strip()
            if not expr_str:
                raise ValueError("No expression provided")
            
            expr = parse_math(expr_str)
            x = sp.Symbol('x')
            result = sp.diff(expr, x)
            str_expr = str(expr).replace('**', '^')
            str_res = str(result).replace('**', '^')
            
            if mode == "quick":
                response_data = {
                    "content": f"⚡ Quick Answer",
                    "solution": {
                        "method": "Differentiation",
                        "steps": [{"label": "Derivative", "math": f"d/dx [{str_expr}] = {str_res}"}],
                        "finalAnswer": str_res,
                        "mode": mode,
                    }
                }
            else:
                response_data = {
                    "content": f"Let's differentiate {str_expr} with respect to x:",
                    "solution": {
                        "method": "Differentiation",
                        "steps": [
                            {
                                "label": "Step 1 — Identify function",
                                "math": f"f(x) = {str_expr}",
                                "explanation": "This is the function we want to differentiate."
                            },
                            {
                                "label": "Step 2 — Compute Derivative",
                                "math": f"f'(x) = d/dx [{str_expr}] = {str_res}",
                                "explanation": "Applying SymPy's differentiation rules."
                            }
                        ],
                        "finalAnswer": f"f'(x) = {str_res}",
                        "graphData": generate_graph_data(result),
                        "mode": mode,
                    }
                }
            return response_data

        # 2. INTEGRAL
        if "integral" in trimmed or "integrate" in trimmed or "∫" in trimmed:
            expr_str = re.sub(r'integral\s*of|integrate|∫', '', trimmed).strip()
            if not expr_str:
                raise ValueError("No expression provided")
                
            expr = parse_math(expr_str)
            x = sp.Symbol('x')
            result = sp.integrate(expr, x)
            str_expr = str(expr).replace('**', '^')
            str_res = str(result).replace('**', '^')
            
            if mode == "quick":
                response_data = {
                    "content": f"⚡ Quick Answer",
                    "solution": {
                        "method": "Integration",
                        "steps": [{"label": "Integral", "math": f"∫ {str_expr} dx = {str_res} + C"}],
                        "finalAnswer": f"{str_res} + C",
                        "mode": mode,
                    }
                }
            else:
                response_data = {
                    "content": f"Let's integrate {str_expr} with respect to x:",
                    "solution": {
                        "method": "Indefinite Integration",
                        "steps": [
                            {
                                "label": "Step 1 — Identify integrand",
                                "math": f"∫ {str_expr} dx",
                                "explanation": "We want to find the antiderivative."
                            },
                            {
                                "label": "Step 2 — Compute Integral",
                                "math": f"∫ {str_expr} dx = {str_res}",
                                "explanation": "Applying SymPy's integration rules."
                            },
                            {
                                "label": "Step 3 — Add Constant",
                                "math": f"{str_res} + C",
                                "explanation": "Every indefinite integral requires an arbitrary constant C."
                            }
                        ],
                        "finalAnswer": f"{str_res} + C",
                        "graphData": generate_graph_data(result),
                        "mode": mode,
                    }
                }
            return response_data

        # 3. EQUATION SOLVING
        if "solve" in trimmed or "=" in trimmed:
            # simple parsing for equations like solve x^2 - 4 = 0
            expr_str = re.sub(r'solve', '', trimmed).strip()
            if "=" in expr_str:
                left, right = expr_str.split("=", 1)
                eq = sp.Eq(parse_math(left), parse_math(right))
                expr_to_plot = parse_math(left) - parse_math(right)
            else:
                eq = sp.Eq(parse_math(expr_str), 0)
                expr_to_plot = parse_math(expr_str)
                
            x = sp.Symbol('x')
            results = sp.solve(eq, x)
            str_eq = str(eq).replace('**', '^').replace('Eq(', '(').replace(', 0)', ' = 0)')
            
            answers = []
            for idx, res in enumerate(results):
                answers.append(f"x_{idx+1} = {str(res).replace('**', '^')}")
            final_ans_str = ", ".join(answers) if answers else "No solution found"
            
            if mode == "quick":
                response_data = {
                    "content": f"⚡ Quick Answer for {str_eq}",
                    "solution": {
                        "method": "Equation Solving",
                        "steps": [{"label": "Roots", "math": final_ans_str}],
                        "finalAnswer": final_ans_str,
                        "mode": mode,
                    }
                }
            else:
                response_data = {
                    "content": f"Let's solve the equation: {str_eq}",
                    "solution": {
                        "method": "Equation Solving",
                        "steps": [
                            {
                                "label": "Step 1 — Set up equation",
                                "math": str_eq,
                                "explanation": "This is the equation we need to solve for x."
                            },
                            {
                                "label": "Step 2 — Find roots",
                                "math": final_ans_str,
                                "explanation": "Using SymPy's algebraic solver to find the exact values of x."
                            }
                        ],
                        "finalAnswer": final_ans_str,
                        "graphData": generate_graph_data(expr_to_plot),
                        "mode": mode,
                    }
                }
            return response_data

        # 4. BASIC EVALUATION / ARITHMETIC
        expr = parse_math(trimmed)
        result = expr.evalf() if expr.is_number else sp.simplify(expr)
        
        str_expr = str(expr).replace('**', '^')
        str_res = str(result).replace('**', '^')
        
        if mode == "quick":
             response_data = {
                "content": f"⚡ Quick Answer",
                "solution": {
                    "method": "Evaluation",
                    "steps": [{"label": "Result", "math": f"{str_expr} = {str_res}"}],
                    "finalAnswer": str_res,
                    "mode": mode,
                }
            }
        else:
             response_data = {
                "content": "Let's evaluate the expression:",
                "solution": {
                    "method": "Mathematical Evaluation",
                    "steps": [
                        {
                            "label": "Expression",
                            "math": str_expr,
                            "explanation": "The original mathematical expression."
                        },
                        {
                            "label": "Simplified / Evaluated",
                            "math": f"{str_expr} = {str_res}",
                            "explanation": "The simplified exact value or evaluated result."
                        }
                    ],
                    "finalAnswer": str_res,
                    "mode": mode,
                }
            }
        return response_data

    except Exception as e:
        # Fallback if SymPy fails to parse
        return response_data
