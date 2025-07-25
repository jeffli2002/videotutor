from manim import *

class MathSolutionScene(Scene):
    def construct(self):
        self.play(Write(Text("###").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("问题分析").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("我们面对的是一个**一元一次方程**：").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("2x + 5 = 15").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("这个方程中，只有一个未知数 $ x $，并且它的最高次数是1（即“一次”），所以我们可以通过基本的代数方法来求解。").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("目标是找出满足这个等式的 $ x $ 的值。也就是说，我们要找到一个数，当它乘以2再加上5后，结果正好是15。").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("---").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("###").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("详细解题步骤").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("**第一步：移项，把常数项移到等号右边**").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("我们先从两边都减去5，目的是把含有 $ x $ 的项留在左边，把常数项移到右边：").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("2x + 5 - 5 = 15 - 5").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("简化后得到：").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("2x = 10").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("> **原理说明**：根据等式的基本性质，等式两边同时加上或减去同一个数，等式仍然成立。").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("---").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("**第二步：消去系数，解出 $ x $**").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("现在我们有：").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("2x = 10").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("为了求出 $ x $，我们需要两边同时除以2：").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("\frac{2x}{2} = \frac{10}{2}").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("简化后得到：").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("x = 5").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("> **原理说明**：同样依据等式的基本性质，等式两边同时除以同一个非零数，等式仍然成立。").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("---").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("###").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("最终答案").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("x = 5").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("---").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("###").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("验证过程").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("将 $ x = 5 $ 代入原方程验证是否成立：").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("原方程为：").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("2x + 5 = 15").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("代入 $ x = 5 $ 得：").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("2(5) + 5 = 10 + 5 = 15").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("$$").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("左边等于右边，所以答案正确。").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("---").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("###").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("相关数学概念").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("- **一元一次方程**：只含有一个未知数，并且未知数的最高次数是1的方程。").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("- **等式的基本性质**：").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("- 等式两边同时加（或减）同一个数，等式仍成立。").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("- 等式两边同时乘（或除以）同一个非零数，等式仍成立。").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("- **解方程**：通过运算找出使方程成立的未知数值。").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("- **代数表达式**：由数字、字母和运算符号组成的数学表达式。").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("---").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("###").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("常见错误提醒").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("- ❌ **忘记对等式两边同时操作**：比如只在一边减5，另一边不变，会导致等式不成立。").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("- ❌ **除法时出错**：如误将 $ 10 ÷ 2 $ 写成 8 或其他错误结果。").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("- ❌ **漏掉负号或符号处理错误**：虽然本题没有负数，但在类似题目中容易出错。").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("- ❌ **未验证答案是否正确**：建议每次解完方程都要代入原式检查一遍。").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("---").scale(0.8)))
        self.wait(1)
        self.play(Write(Text("希望这个详细的讲解能帮助你更好地理解和掌握解一元一次方程的方法！").scale(0.8)))
        self.wait(1)
