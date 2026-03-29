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

def solve_math(input_text: str, language: str = "en") -> Dict[str, Any]:
    trimmed = input_text.strip().lower()

    # Translation map
    T = {
        "en": {
            "no_understand": "I couldn't quite understand that math problem. Could you try rephrasing it?\n\nExamples:\n• derivative of x^2\n• integrate x^2\n• solve x^2 - 4 = 0\n• 125 * 4",
            "diff_method": "Differentiation",
            "diff_content": "Let's differentiate {expr} with respect to x:",
            "diff_step1": "Step 1 — Identify function",
            "diff_step1_expl": "This is the function we want to differentiate.",
            "diff_step2": "Step 2 — Compute Derivative",
            "diff_step2_expl": "Applying SymPy's differentiation rules.",
            "int_method": "Integration",
            "int_indef": "Indefinite Integration",
            "int_content": "Let's integrate {expr} with respect to x:",
            "int_step1": "Step 1 — Identify integrand",
            "int_step1_expl": "We want to find the antiderivative.",
            "int_step2": "Step 2 — Compute Integral",
            "int_step2_expl": "Applying SymPy's integration rules.",
            "int_step3": "Step 3 — Add Constant",
            "int_step3_expl": "Every indefinite integral requires an arbitrary constant C.",
            "solve_method": "Equation Solving",
            "solve_content": "Let's solve the equation: {eq}",
            "solve_step1": "Step 1 — Set up equation",
            "solve_step1_expl": "This is the equation we need to solve for x.",
            "solve_step2": "Step 2 — Find roots",
            "solve_step2_expl": "Using SymPy's algebraic solver to find the exact values of x.",
            "eval_method": "Mathematical Evaluation",
            "eval_content": "Let's evaluate the expression:",
            "eval_step1": "Expression",
            "eval_step1_expl": "The original mathematical expression.",
            "eval_step2": "Simplified / Evaluated",
            "eval_step2_expl": "The simplified exact value or evaluated result.",
            "roots": "Roots",
            "integral": "Integral",
            "derivative": "Derivative",
            "result": "Result"
        },
        "te": {
            "no_understand": "నేను ఆ గణిత సమస్యను పూర్తిగా అర్థం చేసుకోలేకపోయాను. దయచేసి మళ్ళీ వివరించడానికి ప్రయత్నించండి?\n\nఉదాహరణలు:\n• x^2 యొక్క డెరివేటివ్\n• x^2 ని ఇంటిగ్రేట్ చేయండి\n• x^2 - 4 = 0ని సాధించండి\n• 125 * 4",
            "diff_method": "అవకలనం (Differentiation)",
            "diff_content": "మనం x పరంగా {expr}ని అవకలనం చేద్దాం:",
            "diff_step1": "దశ 1 — ప్రమేయాన్ని గుర్తించండి",
            "diff_step1_expl": "ఇది మనం అవకలనం చేయాలనుకుంటున్న ప్రమేయం.",
            "diff_step2": "దశ 2 — డెరివేటివ్‌ని గణించండి",
            "diff_step2_expl": "సింపీ (SymPy) అవకలన నియమాలను వర్తింపజేయడం.",
            "int_method": "సమాకలనం (Integration)",
            "int_indef": "అనిశ్చిత సమాకలనం (Indefinite Integration)",
            "int_content": "మనం x పరంగా {expr}ని సమాకలనం చేద్దాం:",
            "int_step1": "దశ 1 — సమాకలనీయాన్ని గుర్తించండి",
            "int_step1_expl": "మనం దీని యొక్క యాంటీ-డెరివేటివ్‌ను కనుగొనాలనుకుంటున్నాము.",
            "int_step2": "దశ 2 — ఇంటిగ్రల్‌ని గణించండి",
            "int_step2_expl": "సింపీ (SymPy) సమాకలన నియమాలను వర్తింపజేయడం.",
            "int_step3": "దశ 3 — స్థిరాంకాన్ని జోడించండి",
            "int_step3_expl": "ప్రతి అనిశ్చిత సమాకలనానికి ఒక అనిశ్చిత స్థిరాంకం C అవసరం.",
            "solve_method": "సమీకరణ సాధన (Equation Solving)",
            "solve_content": "సమీకరణాన్ని సాధిద్దాం: {eq}",
            "solve_step1": "దశ 1 — సమీకరణాన్ని సెట్ చేయండి",
            "solve_step1_expl": "x కోసం మనం సాధించాల్సిన సమీకరణం ఇది.",
            "solve_step2": "దశ 2 — మూలాలను కనుగొనండి",
            "solve_step2_expl": "x యొక్క ఖచ్చితమైన విలువలను కనుగొనడానికి సింపీ అల్జీబ్రా పరిష్కారిని ఉపయోగిస్తున్నాము.",
            "eval_method": "గణిత మూల్యాంకనం (Mathematical Evaluation)",
            "eval_content": "సమాసాన్ని మూల్యాంకనం చేద్దాం:",
            "eval_step1": "సమాసం (Expression)",
            "eval_step1_expl": "అసలు గణిత సమాసం.",
            "eval_step2": "సరళీకృత / మూల్యాంకనం చేయబడిన",
            "eval_step2_expl": "సరళీకృత ఖచ్చితమైన విలువ లేదా మూల్యాంకనం చేయబడిన ఫలితం.",
            "roots": "మూలాలు (Roots)",
            "integral": "ఇంటిగ్రల్ (Integral)",
            "derivative": "డెరివేటివ్ (Derivative)",
            "result": "ఫలితం (Result)"
        }
    }

    t = T.get(language, T["en"])

    response_data: Dict[str, Any] = {
        "content": t["no_understand"],
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
            
            return {
                "content": t["diff_content"].format(expr=str_expr),
                "solution": {
                    "method": t["diff_method"],
                    "steps": [
                        {
                            "label": t["diff_step1"],
                            "math": f"f(x) = {str_expr}",
                            "explanation": t["diff_step1_expl"]
                        },
                        {
                            "label": t["diff_step2"],
                            "math": f"f'(x) = d/dx [{str_expr}] = {str_res}",
                            "explanation": t["diff_step2_expl"]
                        }
                    ],
                    "finalAnswer": f"f'(x) = {str_res}",
                    "graphData": generate_graph_data(result),
                }
            }

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
            
            return {
                "content": t["int_content"].format(expr=str_expr),
                "solution": {
                    "method": t["int_indef"],
                    "steps": [
                        {
                            "label": t["int_step1"],
                            "math": f"∫ {str_expr} dx",
                            "explanation": t["int_step1_expl"]
                        },
                        {
                            "label": t["int_step2"],
                            "math": f"∫ {str_expr} dx = {str_res}",
                            "explanation": t["int_step2_expl"]
                        },
                        {
                            "label": t["int_step3"],
                            "math": f"{str_res} + C",
                            "explanation": t["int_step3_expl"]
                        }
                    ],
                    "finalAnswer": f"{str_res} + C",
                    "graphData": generate_graph_data(result),
                }
            }

        # 3. EQUATION SOLVING
        if "solve" in trimmed or "=" in trimmed:
            expr_str = re.sub(r'solve', '', trimmed).strip()
            if "=" in expr_str:
                parts = expr_str.split("=", 1)
                left, right = parts[0], parts[1]
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
            
            return {
                "content": t["solve_content"].format(eq=str_eq),
                "solution": {
                    "method": t["solve_method"],
                    "steps": [
                        {
                            "label": t["solve_step1"],
                            "math": str_eq,
                            "explanation": t["solve_step1_expl"]
                        },
                        {
                            "label": t["solve_step2"],
                            "math": final_ans_str,
                            "explanation": t["solve_step2_expl"]
                        }
                    ],
                    "finalAnswer": final_ans_str,
                    "graphData": generate_graph_data(expr_to_plot),
                }
            }

        # 4. BASIC EVALUATION / ARITHMETIC
        expr = parse_math(trimmed)
        result = expr.evalf() if expr.is_number else sp.simplify(expr)
        
        str_expr = str(expr).replace('**', '^')
        str_res = str(result).replace('**', '^')
        
        return {
            "content": t["eval_content"],
            "solution": {
                "method": t["eval_method"],
                "steps": [
                    {
                        "label": t["eval_step1"],
                        "math": str_expr,
                        "explanation": t["eval_step1_expl"]
                    },
                    {
                        "label": t["eval_step2"],
                        "math": f"{str_expr} = {str_res}",
                        "explanation": t["eval_step2_expl"]
                    }
                ],
                "finalAnswer": str_res,
            }
        }

    except Exception:
        return response_data
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
                "content": t["quick_ans"],
                "solution": {
                    "method": t["eval_method"],
                    "steps": [{"label": t["result"], "math": f"{str_expr} = {str_res}"}],
                    "finalAnswer": str_res,
                    "mode": mode,
                }
            }
        else:
             response_data = {
                "content": t["eval_content"],
                "solution": {
                    "method": t["eval_method"],
                    "steps": [
                        {
                            "label": t["eval_step1"],
                            "math": str_expr,
                            "explanation": t["eval_step1_expl"]
                        },
                        {
                            "label": t["eval_step2"],
                            "math": f"{str_expr} = {str_res}",
                            "explanation": t["eval_step2_expl"]
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
