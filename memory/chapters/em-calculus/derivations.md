# Calculus: derivations

## The standard limits
<!-- topics: em-calculus.standard-limits -->

**Claim.** With $x$ in radians and $x \to 0$:

$$\frac{\sin x}{x} \to 1, \qquad \frac{\tan x}{x} \to 1, \qquad \frac{1-\cos x}{x^2} \to \frac12, \qquad \frac{e^x-1}{x} \to 1, \qquad \frac{\ln(1+x)}{x} \to 1, \qquad \frac{a^x-1}{x} \to \ln a \ (a>0).$$

As $x \to \infty$, $(1 + a/x)^x \to e^a$ for every real $a$, and $n^{1/n} \to 1$ as $n \to \infty$. For polynomials $p$ and $q$ of degrees $m$ and $d$ with leading coefficients $p_m$ and $q_d$, $p(x)/q(x) \to p_m/q_d$ when $m = d$, $\to 0$ when $m < d$, and $\to \pm\infty$ when $m > d$. A two-sided limit exists exactly when both one-sided limits exist and are equal.

**Proof.** *Sine.* Take $0 < x < \pi/2$ on the unit circle. The triangle with vertices the origin, $(1, 0)$ and $(\cos x, \sin x)$ has area $\tfrac12 \sin x$; it lies inside the circular sector of angle $x$, of area $\tfrac12 x$ (this is where radians enter); the sector lies inside the right triangle with legs $1$ and $\tan x$, of area $\tfrac12 \tan x$. So $\sin x < x < \tan x$. Dividing by $\sin x > 0$ and inverting gives $\cos x < \frac{\sin x}{x} < 1$. As $x \to 0^+$, $\cos x \to 1$, so the squeeze gives $\sin x / x \to 1$. Since $\sin(-x)/(-x) = \sin x / x$, the left limit is the same.

*Tangent and cosine.* $\tan x / x = (\sin x / x)\cdot(1/\cos x) \to 1 \cdot 1$. With $1 - \cos x = 2\sin^2(x/2)$,

$$\frac{1-\cos x}{x^2} = \frac12\left(\frac{\sin(x/2)}{x/2}\right)^2 \to \frac12.$$

*Exponential and logarithm.* $(e^x - 1)/x = (e^x - e^0)/(x - 0)$ is the difference quotient of $e^x$ at $0$, so its limit is the derivative $e^0 = 1$. Likewise $\ln(1+x)/x = (\ln(1+x) - \ln 1)/x$ tends to $(\ln)'(1) = 1$. Writing $a^x = e^{x \ln a}$ and $u = x \ln a$ gives $(a^x - 1)/x = \ln a \cdot (e^u - 1)/u \to \ln a$ when $a \ne 1$; for $a = 1$ both sides are $0$.

*The limit $e^a$.* For $a \ne 0$, $\ln(1 + a/x)^x = x \ln(1 + a/x) = a \cdot \frac{\ln(1+t)}{t}$ with $t = a/x \to 0$, so the logarithm tends to $a$, and continuity of $\exp$ gives $e^a$. For $a = 0$ the expression is $1 = e^0$.

*$n^{1/n}$.* $\ln n^{1/n} = (\ln n)/n$. From $\ln y < y$ with $y = \sqrt n$ we get $\ln n = 2\ln\sqrt n < 2\sqrt n$, so $0 \le (\ln n)/n < 2/\sqrt n \to 0$ for $n \ge 1$, and $n^{1/n} \to e^0 = 1$.

*Polynomial ratio.* Divide numerator and denominator by $x^d$. Every term $c x^j / x^d$ with $j < d$ tends to $0$, the denominator tends to $q_d \ne 0$, and the numerator tends to $p_m$ (if $m = d$), to $0$ (if $m < d$), or grows like $p_m x^{m-d}$ (if $m > d$).

*Rescaling.* For $k \ne 0$, $\sin(kx)/x = k \cdot \sin(kx)/(kx)$, and $kx \to 0$ as $x \to 0$, so the limit is $k$. The same move turns $\ln(1 + 5x)/x$ into $5 \cdot \ln(1 + 5x)/(5x) \to 5$.

**GATE use.** One-mark NATs that are a standard limit in disguise: rescale until the argument of $\sin$, $\ln(1+\cdot)$ or $e^{(\cdot)} - 1$ matches the denominator, then multiply by the constant pulled out. The traps are using degrees (then $\sin x / x \to \pi/180$), forgetting the rescaling factor, and declaring a two-sided limit from one side only, as with $\lvert x \rvert/x$, which is $+1$ from the right and $-1$ from the left and has no limit at $0$.

**Check.** At $x = 10^{-5}$, $\sin 3x / x = 3.000000$; at $x = 10^{-3}$, $(1-\cos x)/x^2 = 0.49999996$; at $x = 10^{-7}$, $\ln(1+5x)/x = 4.9999988$ and $(2^x - 1)/x$ agrees with $\ln 2 = 0.693147$. $(1 + 2/x)^x$ at $x = 10^7$ is $7.389055 \approx e^2$, $(3x^2 + x)/(x^2 + 1)$ at $x = 10^6$ is $3.000001$, and $(10^6)^{10^{-6}} = 1.0000138$.

## Continuity, differentiability and the derivative rules
<!-- topics: em-calculus.continuity, em-calculus.differentiability -->

**Claim.** $f$ is continuous at $a$ when $f(a)$ is defined, $\lim_{x\to a} f(x)$ exists, and the two are equal. $f$ is differentiable at $a$ when $f'(a) = \lim_{h\to 0}\frac{f(a+h)-f(a)}{h}$ exists, which requires the right-hand ($h \to 0^+$) and left-hand ($h \to 0^-$) quotients to have the same finite limit. Then:

1. Differentiable at $a$ implies continuous at $a$; the converse is false ($\lvert x \rvert$, and $x\sin(1/x)$ with value $0$ at $0$).
2. $x\lvert x \rvert$ is differentiable at $0$ with derivative $0$.
3. Where $f$ and $g$ are differentiable (and $g \ne 0$ for the quotient), $(fg)' = f'g + fg'$, $(f/g)' = (f'g - fg')/g^2$, and $(f\circ g)'(x) = f'(g(x))\,g'(x)$ when $g$ is differentiable at $x$ and $f$ at $g(x)$.

A discontinuity at $a$ is *removable* when the limit exists but $f(a)$ is undefined or different, a *jump* when the one-sided limits exist and differ, and *infinite* when $f$ is unbounded near $a$.

**Proof.** *1.* For $h \ne 0$, $f(a+h) - f(a) = h \cdot \frac{f(a+h)-f(a)}{h}$. The first factor tends to $0$ and the second to $f'(a)$, so the product tends to $0 \cdot f'(a) = 0$, which is continuity. For $\lvert x \rvert$ at $0$ the quotient is $\lvert h \rvert/h$, equal to $+1$ for $h > 0$ and $-1$ for $h < 0$: the one-sided derivatives differ, while $\lvert x \rvert \to 0$ from both sides. For $x\sin(1/x)$, $\lvert x\sin(1/x) \rvert \le \lvert x \rvert \to 0 = f(0)$, so it is continuous, but the quotient $h\sin(1/h)/h = \sin(1/h)$ equals $1$ at $h = 1/(2\pi k + \pi/2)$ and $-1$ at $h = 1/(2\pi k + 3\pi/2)$ for every integer $k$, points arbitrarily close to $0$, so it has no limit.

*2.* $f(h) - f(0) = h\lvert h \rvert$, so the quotient is $\lvert h \rvert \to 0$ from both sides. Equivalently, $f = x^2$ for $x \ge 0$ and $-x^2$ for $x < 0$, and both pieces have slope $0$ at $0$.

*3. Product.* Add and subtract $f(x+h)g(x)$:

$$\frac{f(x+h)g(x+h) - f(x)g(x)}{h} = f(x+h)\frac{g(x+h)-g(x)}{h} + g(x)\frac{f(x+h)-f(x)}{h}.$$

By part 1, $f(x+h) \to f(x)$, so the right side tends to $fg' + gf'$. *Quotient.* The quotient of $1/g$ is $\frac{g(x) - g(x+h)}{h\,g(x+h)g(x)} \to -g'/g^2$, using continuity of $g$ and $g(x) \ne 0$. The product rule applied to $f \cdot (1/g)$ gives $f'/g - fg'/g^2 = (f'g - fg')/g^2$. *Chain.* Let $b = g(x)$ and define $\varphi(k) = \frac{f(b+k)-f(b)}{k}$ for $k \ne 0$ and $\varphi(0) = f'(b)$, so $\varphi$ is continuous at $0$ and $f(b+k) - f(b) = \varphi(k)\,k$ for all $k$, including $k = 0$. With $k = g(x+h) - g(x)$,

$$\frac{f(g(x+h)) - f(g(x))}{h} = \varphi(k)\,\frac{g(x+h)-g(x)}{h}.$$

As $h \to 0$, $k \to 0$ by continuity of $g$, so $\varphi(k) \to f'(b)$ and the quotient tends to $f'(g(x))\,g'(x)$. The auxiliary $\varphi$ is needed because $k$ can be $0$ for small $h$, where dividing by $k$ is illegal.

*Implicit differentiation* is the chain rule applied to $y = y(x)$: differentiating $x^2 + y^2 = 1$ gives $2x + 2y\,y' = 0$, so $y' = -x/y$ wherever $y \ne 0$.

*Discontinuities.* $(x^2 - 1)/(x - 1) = x + 1$ for $x \ne 1$, so the limit at $1$ is $2$ and redefining $f(1) = 2$ removes the discontinuity. $\lfloor x \rfloor$ at an integer $n$ has left limit $n - 1$ and right limit $n$: a jump. $1/x$ is unbounded near $0$.

**GATE use.** The MSQ "which functions are continuous but not differentiable at $0$": test continuity with the one-sided limits and $f(a)$, then compute both one-sided difference quotients from the definition, not by differentiating each piece formula, which can mislead when $f(a)$ itself is off. The traps are assuming any $\lvert\cdot\rvert$ creates a corner ($x\lvert x \rvert$ is smooth at $0$), assuming continuity gives differentiability, and dropping the inner derivative in the chain rule.

**Check.** For $h = \pm 10^{-6}$ the quotient of $\lvert x \rvert$ is $+1$ and $-1$, and that of $x\lvert x \rvert$ is $10^{-6}$. At $k = 1000$ the quotient of $x\sin(1/x)$ is $1.000000$ at $h = 1/(2000\pi + \pi/2)$ and $-1.000000$ at $h = 1/(2000\pi + 3\pi/2)$. On the upper unit circle $y = \sqrt{1-x^2}$, a central difference at $x = 0.6$ gives $-0.75 = -0.6/0.8$.

## Rolle's theorem and the mean value theorems
<!-- topics: em-calculus.mean-value-theorems, em-calculus.continuity -->

**Claim.** Let $f$ and $g$ be continuous on $[a, b]$ and differentiable on $(a, b)$, with $a < b$.

1. (Rolle) If $f(a) = f(b)$, some $c \in (a, b)$ has $f'(c) = 0$.
2. (Lagrange) Some $c \in (a, b)$ has $f'(c) = \dfrac{f(b)-f(a)}{b-a}$.
3. (Cauchy) If $g'(x) \ne 0$ on $(a, b)$, some $c \in (a, b)$ has $\dfrac{f(b)-f(a)}{g(b)-g(a)} = \dfrac{f'(c)}{g'(c)}$.

The proof takes the extreme value theorem as given: a function continuous on a closed bounded interval attains a maximum and a minimum there.

**Proof.** *Fermat's lemma.* If $f$ has a local maximum at an interior point $c$ and $f'(c)$ exists, then $f'(c) = 0$. Near $c$, $f(c+h) - f(c) \le 0$. For $h > 0$ the quotient is $\le 0$, so the right-hand limit is $\le 0$; for $h < 0$ it is $\ge 0$, so the left-hand limit is $\ge 0$. Both equal $f'(c)$, so $f'(c) = 0$. A local minimum is the same with signs reversed.

*1.* By the extreme value theorem $f$ attains a maximum $M$ and a minimum $m$ on $[a, b]$. If both are attained only at the endpoints, then $M = m = f(a)$ since $f(a) = f(b)$, so $f$ is constant and $f' = 0$ everywhere in $(a, b)$. Otherwise one of them is attained at some $c \in (a, b)$, where $f$ is differentiable, and Fermat's lemma gives $f'(c) = 0$. Continuity on the closed interval enters through the extreme value theorem, differentiability inside through Fermat.

*2.* Let $m = (f(b)-f(a))/(b-a)$, the slope of the chord, and $\varphi(x) = f(x) - f(a) - m(x - a)$, the vertical gap between the graph and the chord. $\varphi$ inherits the hypotheses and $\varphi(a) = \varphi(b) = 0$, so Rolle gives $c$ with $0 = \varphi'(c) = f'(c) - m$.

*3.* First, $g(b) \ne g(a)$: otherwise Rolle applied to $g$ would give a point with $g' = 0$. Let

$$\psi(x) = \big(f(b)-f(a)\big)\big(g(x)-g(a)\big) - \big(g(b)-g(a)\big)\big(f(x)-f(a)\big).$$

Then $\psi(a) = 0$ and $\psi(b) = (f(b)-f(a))(g(b)-g(a)) - (g(b)-g(a))(f(b)-f(a)) = 0$, so Rolle gives $c$ with $(f(b)-f(a))\,g'(c) = (g(b)-g(a))\,f'(c)$. Dividing by $g'(c)\,(g(b)-g(a)) \ne 0$ gives the claim. With $g(x) = x$ it is Lagrange's form. This is the proof in Apostol, *Calculus* Vol. 1.

*Hypotheses matter.* $\lvert x \rvert$ on $[-1, 1]$ has equal endpoint values, but $f' = \pm 1$ wherever it exists: differentiability fails at $0$. $\tan x$ on $[0, \pi]$ has $\tan 0 = \tan \pi = 0$, but it is undefined at $\pi/2$, so continuity fails.

**GATE use.** "Find the $c$ of the mean value theorem" for a polynomial: compute the chord slope, solve $f'(c) = $ slope, and keep the root in the open interval $(a, b)$. The trap is reporting the other root of the quadratic. An MSQ asks which function satisfies Rolle's hypotheses; check equal endpoint values, continuity on the closed interval and differentiability inside, and reject on any single failure.

**Check.** $x^3$ on $[1, 3]$: slope $(27 - 1)/2 = 13$, $3c^2 = 13$, $c = \sqrt{13/3} = 2.0817 \in (1, 3)$. $f(x) = x(x-1)(x-2) = x^3 - 3x^2 + 2x$ on $[0, 1/2]$: $f(1/2) = 3/8$, slope $3/4$, $3c^2 - 6c + 2 = 3/4$ gives $12c^2 - 24c + 5 = 0$ and $c = 1 \pm \sqrt{21}/6$, that is $0.2362$ or $1.7638$; only $0.2362$ lies in $(0, 1/2)$, and $f'(0.2362) = 0.75$. Rolle on $x^2 - 4x + 3$ over $[1, 3]$ gives $c = 2$. Cauchy with $f = x^2$, $g = x^3$ on $[0, 1]$ ($g' = 3x^2 \ne 0$ inside): $1/1 = 2c/(3c^2)$ gives $c = 2/3$.

## L'Hôpital's rule
<!-- topics: em-calculus.lhopital -->

**Claim.** Let $f$ and $g$ be differentiable on a punctured neighbourhood of $a$ with $g'(x) \ne 0$ there, and let $f(x) \to 0$ and $g(x) \to 0$ as $x \to a$. If $\lim_{x\to a} f'(x)/g'(x) = L$, with $L$ finite or $\pm\infty$, then $\lim_{x\to a} f(x)/g(x) = L$. The same conclusion holds for $x \to \pm\infty$, and for the form $\infty/\infty$ ($\lvert g \rvert \to \infty$). If $\lim f'/g'$ does not exist, the rule gives no information about $\lim f/g$.

**Proof.** *The $0/0$ case at a finite point, from the right.* Redefine $f(a) = g(a) = 0$; this does not change any limit as $x \to a$ and makes $f$ and $g$ continuous on $[a, x]$ for each $x$ slightly greater than $a$. They are differentiable on $(a, x)$ with $g' \ne 0$, so Cauchy's mean value theorem gives $c_x \in (a, x)$ with

$$\frac{f(x)}{g(x)} = \frac{f(x) - f(a)}{g(x) - g(a)} = \frac{f'(c_x)}{g'(c_x)}.$$

As $x \to a^+$, $a < c_x < x$ forces $c_x \to a^+$, so the right side tends to $L$. The left-hand limit is the same argument on $[x, a]$, and the two together give the two-sided limit.

*At infinity.* For $x \to \infty$ put $x = 1/t$ with $t \to 0^+$, and let $F(t) = f(1/t)$, $G(t) = g(1/t)$. By the chain rule $F'(t)/G'(t) = \big(-f'(1/t)/t^2\big)/\big(-g'(1/t)/t^2\big) = f'(x)/g'(x)$, so the finite-point case applies to $F/G$.

*The $\infty/\infty$ case, from the right, $L$ finite.* Only $\lvert g \rvert \to \infty$ is used; $f$ may stay bounded, as for $f = 1$, $g = 1/x$. Fix $\varepsilon > 0$ and choose $y > a$ first, so close to $a$ that $\lvert f'(t)/g'(t) - L \rvert < \varepsilon$ for every $t \in (a, y)$. For $a < x < y$, $g(x) \ne g(y)$ by Rolle, since $g' \ne 0$, and Cauchy's theorem on $[x, y]$ gives $c \in (x, y) \subset (a, y)$ with $f(x) - f(y) = q\,(g(x) - g(y))$, where $q = f'(c)/g'(c)$ and $\lvert q - L \rvert < \varepsilon$. Dividing by $g(x)$,

$$\frac{f(x)}{g(x)} = q + \frac{f(y) - q\,g(y)}{g(x)}.$$

With $y$ now held fixed, the numerator of the last term is bounded by $\lvert f(y) \rvert + (\lvert L \rvert + \varepsilon)\lvert g(y) \rvert$, and $\lvert g(x) \rvert \to \infty$ as $x \to a^+$, so that term tends to $0$. Hence $\lvert f(x)/g(x) - L \rvert < 2\varepsilon$ for $x$ close enough to $a$, and $\varepsilon$ was arbitrary. For $L = +\infty$ the same choice of $y$ with $f'/g' > M$ on $(a, y)$ gives $f(x)/g(x) > M - 1$ near $a$. This is the argument of Rudin, *Principles of Mathematical Analysis*, Theorem 5.13.

*Why the form must be checked.* The proof uses $f(a) = g(a) = 0$ in the first step. For $(x+1)/(x+2)$ at $x = 0$ the form is the determinate $1/2$, which is the limit; differentiating would give the wrong value $1/1$. *Why a missing $\lim f'/g'$ says nothing.* The claim is one-directional. For $(x - \sin x)/(x + \cos x)$ as $x \to \infty$, $f'/g' = (1 - \cos x)/(1 - \sin x)$ oscillates without limit, yet dividing by $x$ gives $(1 - \sin x / x)/(1 + \cos x / x) \to 1$, because $\lvert \sin x \rvert, \lvert \cos x \rvert \le 1$.

*Repeated use.* Apply the rule again only if $f'/g'$ is again $0/0$ or $\infty/\infty$. For $(e^x - 1 - x)/x^2$ at $0$: $0/0$, then $(e^x - 1)/(2x)$, still $0/0$, then $e^x/2 \to 1/2$.

**GATE use.** A one-mark NAT limit. Substitute first; if the result is determinate, stop. Factor when a polynomial root cancels, and otherwise differentiate the numerator and the denominator separately, never the quotient. The traps are applying the rule to a determinate form, using the quotient rule on $f/g$, and choosing "limit does not exist" because $f'/g'$ oscillates.

**Check.** $(e^x - 1 - x)/x^2$ at $x = 10^{-4}$ is $0.50002$. $(x^4 - 81)/(2x^2 - 5x - 3)$ near $x = 3$ is $15.4286$: factoring gives $(x+3)(x^2+9)/(2x+1) = 6 \cdot 18 / 7 = 108/7$, and one round of the rule gives $4x^3/(4x - 5) = 108/7$ at $3$. $(x - \sin x)/(x + \cos x)$ at $x = 10^7$ is $1.0000000$ to seven places.

## The forms $1^\infty$, $0^0$, $\infty^0$, $0\cdot\infty$ and $\infty-\infty$
<!-- topics: em-calculus.other-indeterminate-forms -->

**Claim.** For $f > 0$, $\lim f^g = \exp\big(\lim g \ln f\big)$ whenever the inner limit exists (finite, or $-\infty$ giving $0$, or $+\infty$ giving $\infty$). In the $1^\infty$ case ($f \to 1$, $g \to \pm\infty$), if $\lim g\,(f - 1) = \lambda$ is finite then

$$\lim f^g = e^{\lambda}.$$

A $0\cdot\infty$ product $uv$ becomes $\frac{u}{1/v}$ or $\frac{v}{1/u}$, a $0/0$ or $\infty/\infty$ form, and an $\infty - \infty$ difference becomes a single fraction after a common denominator or rationalisation.

**Derivation.** *Logs.* $f^g = e^{g\ln f}$ by definition of a real power with positive base, and $\exp$ is continuous, so $\lim e^{h} = e^{\lim h}$. The three power forms $1^\infty$, $0^0$ and $\infty^0$ are exactly those where $g\ln f$ is a $0 \cdot \infty$ product.

*The $1^\infty$ shortcut.* Put $u = f - 1 \to 0$. Where $u \ne 0$,

$$g \ln f = g\,u \cdot \frac{\ln(1+u)}{u},$$

and the last factor tends to $1$ by the standard limit; where $u = 0$ both $g\ln f$ and $g u$ are $0$. So if $g u \to \lambda$, then $g \ln f \to \lambda \cdot 1$, and $f^g \to e^\lambda$. The shortcut replaces $\ln f$ by its first-order approximation $f - 1$, and the standard limit is what makes that exact in the limit.

*Examples.* $(1 + 3x)^{1/x}$ as $x \to 0$: $g(f - 1) = 3x/x = 3$, so the limit is $e^3$. $(\cos x)^{1/x^2}$ as $x \to 0$: $g(f-1) = (\cos x - 1)/x^2 \to -1/2$, so the limit is $e^{-1/2}$. $x^{1/x}$ as $x \to \infty$ ($\infty^0$): $g\ln f = (\ln x)/x$, and L'Hôpital gives $(1/x)/1 \to 0$, so the limit is $e^0 = 1$. $x^x$ as $x \to 0^+$ ($0^0$): $x\ln x = \frac{\ln x}{1/x}$, an $\infty/\infty$ form; L'Hôpital gives $\frac{1/x}{-1/x^2} = -x \to 0$, so $x\ln x \to 0$ and $x^x \to 1$.

*$\infty - \infty$.* $\sqrt{x^2 + x} - x = \dfrac{(x^2 + x) - x^2}{\sqrt{x^2+x} + x} = \dfrac{x}{\sqrt{x^2+x}+x} = \dfrac{1}{\sqrt{1 + 1/x} + 1} \to \dfrac12$ as $x \to \infty$. $\dfrac1x - \dfrac1{\sin x} = \dfrac{\sin x - x}{x\sin x}$, a $0/0$ form whose numerator is $-x^3/6 + \dots$ and denominator $x^2 + \dots$, so it tends to $0$.

**GATE use.** Spot the base tending to $1$ and the exponent blowing up, then compute $\lim g(f-1)$ in one line. The traps are evaluating $1^\infty$ as $1$, applying L'Hôpital directly to a power, and splitting $\infty - \infty$ as $\infty - \infty = 0$.

**Check.** $(1 + 3x)^{1/x}$ at $x = 10^{-8}$ is $20.0855 \approx e^3$. $(\cos x)^{1/x^2}$ at $x = 10^{-3}$ is $0.60653 \approx e^{-1/2}$. $1000^{1/1000} = 1.0069$. $x\ln x$ at $10^{-8}$ is $-1.8 \times 10^{-7}$. $\sqrt{x^2 + x} - x$ at $x = 10^6$ is $0.4999999$, and $1/x - 1/\sin x$ at $x = 10^{-3}$ is $-0.000167 \approx -x/6$.

## Monotonicity, concavity and extrema
<!-- topics: em-calculus.monotonicity-concavity, em-calculus.local-extrema, em-calculus.global-extrema -->

**Claim.** Items 1, 3 and 4 take $f$ differentiable on an interval $I$; items 2 and 5 state their own hypotheses.

1. If $f' > 0$ on $I$, $f$ is strictly increasing on $I$. $f' \ge 0$ on $I$ holds exactly when $f$ is non-decreasing on $I$. The converse of the first statement fails.
2. (First derivative test) Let $f$ be continuous at $c$ and differentiable on $(c - \delta, c) \cup (c, c + \delta)$. If $f' > 0$ on $(c - \delta, c)$ and $f' < 0$ on $(c, c + \delta)$, $c$ is a strict local maximum; with the signs swapped, a local minimum; with no sign change, no extremum. $f'(c)$ need not exist.
3. (Second derivative test) If $f'(c) = 0$ and $f''(c) > 0$, $c$ is a strict local minimum; if $f''(c) < 0$, a strict local maximum; $f''(c) = 0$ decides nothing.
4. (Convexity) If $f'' > 0$ on $I$, the graph lies strictly above each of its tangent lines, except at the point of tangency. An inflection point is where $f''$ changes sign.
5. (Global extrema) A continuous $f$ on $[a, b]$ attains its maximum and minimum at an endpoint or at an interior critical point (where $f' = 0$ or $f'$ does not exist).
6. $a\sin x + b\cos x$ has maximum $\sqrt{a^2 + b^2}$ and minimum $-\sqrt{a^2 + b^2}$.

**Proof.** *1.* For $x < y$ in $I$, the mean value theorem gives $f(y) - f(x) = f'(c)(y - x)$ with $c \in (x, y)$. If $f' > 0$ this is positive; if $f' \ge 0$ it is $\ge 0$. Conversely, if $f$ is non-decreasing, every difference quotient $(f(x+h) - f(x))/h$ is $\ge 0$ (numerator and $h$ have the same sign, or the numerator is $0$), so its limit $f'(x)$ is $\ge 0$. The converse of the strict statement fails: $x^3$ is strictly increasing, since $y^3 - x^3 = (y - x)(x^2 + xy + y^2)$ and the second factor is positive unless $x = y = 0$, yet its derivative at $0$ is $0$. This corrects the "if and only if $f' > 0$" form recorded in the chapter errata.

*2.* By part 1, $f$ is increasing on $(c - \delta, c)$ and decreasing on $(c, c + \delta)$. For $t$ in the left piece, $f(t) < f(s)$ for every $s \in (t, c)$, and letting $s \to c$ with continuity at $c$ gives $f(t) \le f(c)$. For $x$ in the left piece pick any $t \in (x, c)$: then $f(x) < f(t) \le f(c)$, so $f(x) < f(c)$. The right piece is symmetric. So $f(c)$ is a strict local maximum. Continuity at $c$ is what lets the test cover corners such as $\lvert x \rvert$ at $0$, where $f'$ changes from $-1$ to $+1$: a minimum. If $f'$ has one sign on both sides, $f$ is monotone through $c$ and there is no extremum.

*3.* Since $f'(c) = 0$, $f''(c) = \lim_{x\to c} \frac{f'(x)}{x - c}$. If this is positive, then for $x$ near $c$ the ratio is positive, so $f'(x)$ has the sign of $x - c$: negative to the left, positive to the right. Part 2 gives a strict minimum. The negative case is symmetric. For $f''(c) = 0$, at $c = 0$ the functions $x^4$ (minimum), $-x^4$ (maximum) and $x^3$ (neither) all have $f' = f'' = 0$; fall back on the first derivative test.

*4.* Fix $a \in I$ and let $g(x) = f(x) - f(a) - f'(a)(x - a)$, the height of the graph above the tangent at $a$. Then $g(a) = 0$ and $g'(x) = f'(x) - f'(a)$. $f'' > 0$ makes $f'$ strictly increasing (part 1 applied to $f'$), so $g'$ is negative for $x < a$ and positive for $x > a$; $g$ falls to $0$ and rises again, so $g(x) > 0$ for $x \ne a$. An inflection point needs a sign change of $f''$: $x^4$ has $f''(x) = 12x^2 \ge 0$ on both sides of $0$, so it is convex throughout and $0$ is not an inflection point although $f''(0) = 0$.

*5.* The extreme value theorem gives the maximum at some point $c$. If $c$ is interior and $f'(c)$ exists, Fermat's lemma forces $f'(c) = 0$. So $c$ is an endpoint, a stationary point or a point where $f'$ fails to exist, and comparing $f$ over this finite candidate list finds the maximum. The second derivative test is not needed and can mislead: it certifies a local maximum, which an endpoint can beat.

*6.* With $R = \sqrt{a^2 + b^2} > 0$, pick $\varphi$ with $\cos\varphi = a/R$ and $\sin\varphi = b/R$. Then $a\sin x + b\cos x = R(\sin x\cos\varphi + \cos x\sin\varphi) = R\sin(x + \varphi)$, whose range is $[-R, R]$.

**GATE use.** The two-mark NAT "maximum of a cubic on $[a, b]$": list the critical points inside, evaluate at them and at both endpoints, and take the largest; the trap is answering with the local maximum. An MSQ on $x^3 - 3x^2 + 2$ asks for local extrema, inflection points and intervals of increase. The trap there is taking $f''(c) = 0$ to mean an inflection point, or quoting "saddle point" for one variable.

**Check.** $x^3 - 3x$: $f' = 3(x^2 - 1)$, $f'' = 6x$; $f(1) = -2$ is a minimum and $f(-1) = 2$ a maximum. $x^3 - 3x^2 + 2$: $f' = 3x(x - 2)$, $f'' = 6x - 6$; $f(0) = 2$ maximum, $f(2) = -2$ minimum, inflection at $x = 1$, and $f'(1) = -3$ so $f$ decreases on $(0, 2)$. $2x^3 - 9x^2 + 12x - 3$ on $[0, 3]$: $f' = 6(x-1)(x-2)$ and $f(0), f(1), f(2), f(3) = -3, 2, 1, 6$; a grid of step $0.001$ confirms the maximum $6$ at the endpoint. $x^2$ on $[-2, 1]$: candidates $4, 0, 1$, maximum $4$ at $-2$. A grid over $[0, 2\pi]$ gives $\max(\sin x + \cos x) = 1.414214 = \sqrt2$ and $\max(3\sin x + 4\cos x) = 5$.

## Taylor's theorem and the Maclaurin series
<!-- topics: em-calculus.taylor-series, em-calculus.lhopital -->

**Claim.** If $f$ has $n + 1$ derivatives on an interval containing $a$ and $x$, then for some $\xi$ strictly between $a$ and $x$ (or $\xi = a$ when $x = a$),

$$f(x) = \sum_{k=0}^{n}\frac{f^{(k)}(a)}{k!}(x - a)^k + \frac{f^{(n+1)}(\xi)}{(n+1)!}(x - a)^{n+1}.$$

At $a = 0$ the remainder tends to $0$ as $n \to \infty$ for every real $x$ when $f$ is $e^x$, $\sin x$ or $\cos x$, giving

$$e^x = \sum_{n\ge0}\frac{x^n}{n!}, \quad \sin x = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots, \quad \cos x = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots,$$

and $\ln(1 + x) = x - x^2/2 + x^3/3 - \cdots$ holds exactly for $-1 < x \le 1$.

**Proof.** Fix $x \ne a$ and choose the constant $K$ so that

$$F(t) = f(x) - \sum_{k=0}^{n}\frac{f^{(k)}(t)}{k!}(x - t)^k - \frac{K}{(n+1)!}(x - t)^{n+1}$$

has $F(a) = 0$. Also $F(x) = f(x) - f(x) = 0$, since only the $k = 0$ term survives at $t = x$. Differentiating the $k$-th term of the sum in $t$ gives $\frac{f^{(k+1)}(t)}{k!}(x-t)^k - \frac{f^{(k)}(t)}{(k-1)!}(x-t)^{k-1}$ (the second part absent for $k = 0$), so the sum telescopes and

$$F'(t) = -\frac{f^{(n+1)}(t)}{n!}(x - t)^n + \frac{K}{n!}(x - t)^n.$$

Rolle's theorem on the interval between $a$ and $x$ gives $\xi$ with $F'(\xi) = 0$, and since $x - \xi \ne 0$, $K = f^{(n+1)}(\xi)$. Then $F(a) = 0$ is the claimed formula.

*The series.* Every derivative of $e^x$ is $e^x$, equal to $1$ at $0$, and the remainder is at most $e^{\lvert x \rvert}\lvert x \rvert^{n+1}/(n+1)!$, which tends to $0$ because the factorial outgrows any power. The derivatives of $\sin$ cycle through $\cos, -\sin, -\cos, \sin$, so at $0$ they cycle $0, 1, 0, -1$, leaving only odd powers with alternating signs; all derivatives are bounded by $1$, so the remainder is at most $\lvert x \rvert^{n+1}/(n+1)! \to 0$. Cosine is the same with even powers. For $\ln(1 + x)$, integrate $\frac{1}{1+t} = \sum_{k=0}^{n-1}(-t)^k + \frac{(-t)^n}{1+t}$ from $0$ to $x$: the error term is at most $\int_0^{\lvert x \rvert} t^n\,dt/(1 - \lvert x \rvert) \to 0$ for $\lvert x \rvert < 1$, and for $0 \le x \le 1$ it is at most $\int_0^x t^n\,dt \le 1/(n+1) \to 0$, which covers $x = 1$ and gives $\ln 2 = 1 - \tfrac12 + \tfrac13 - \cdots$. For $\lvert x \rvert > 1$ the terms $x^k/k$ do not tend to $0$, so the series diverges; the radius of convergence is $1$.

*Limits by series.* Expanding to the first non-cancelling order settles $0/0$ forms: $(e^x - 1 - x)/x^2 = (x^2/2 + x^3/6 + \cdots)/x^2 \to 1/2$ and $(x - \sin x)/x^3 = (x^3/6 - \cdots)/x^3 \to 1/6$.

*Products.* Multiplying two series, the coefficient of $x^n$ is the sum over $j + k = n$ of the products of coefficients. For $e^x\sin x$ at $x^3$: $1 \cdot (-\tfrac16) + \tfrac12 \cdot 1 = \tfrac13$, from $1 \cdot (-x^3/6)$ and $(x^2/2) \cdot x$.

**GATE use.** A coefficient MCQ ("the $x^3$ coefficient of $e^x\sin x$") or a limit that is quicker by series than by three rounds of L'Hôpital. The traps are missing a cross term in a product, using $\ln(1 + x)$ outside $(-1, 1]$, and forgetting the factorials ($x^3/3!$, not $x^3/3$, in $\sin x$).

**Check.** $e^x\sin x = \operatorname{Im} e^{(1+i)x}$, so its third derivative at $0$ is $\operatorname{Im}(1 + i)^3 = \operatorname{Im}(-2 + 2i) = 2$ and the coefficient is $2/3! = 1/3$; a five-point finite difference agrees. $(x - \sin x)/x^3$ at $x = 0.01$ is $0.166666$. The degree-4 polynomial for $e^{0.5}$ is $1.6484375$; the true error $0.000284$ is inside the Lagrange bound $e^{0.5}(0.5)^5/120 = 0.000429$. The first $10^6$ terms of $1 - \tfrac12 + \tfrac13 - \cdots$ give $\ln 2$ to six places.

## The fundamental theorem of calculus and the Leibniz rule
<!-- topics: em-calculus.fundamental-theorem, em-calculus.definite-integral-properties -->

**Claim.** Let $f$ be continuous on an interval containing $a$.

1. $F(x) = \int_a^x f(t)\,dt$ is differentiable with $F'(x) = f(x)$.
2. If $G' = f$ on $[a, b]$, then $\int_a^b f(x)\,dx = G(b) - G(a)$, for every antiderivative $G$.
3. If $u$ and $v$ are differentiable with values in that interval,

$$\frac{d}{dx}\int_{u(x)}^{v(x)} f(t)\,dt = f\big(v(x)\big)\,v'(x) - f\big(u(x)\big)\,u'(x).$$

**Proof.** *1.* For $h > 0$, additivity of the integral gives $F(x + h) - F(x) = \int_x^{x+h} f(t)\,dt$. On $[x, x + h]$ the continuous $f$ has a minimum $m_h$ and a maximum $M_h$, so $m_h h \le \int_x^{x+h} f \le M_h h$; by the intermediate value theorem the average $\frac1h\int_x^{x+h} f$ equals $f(\xi_h)$ for some $\xi_h \in [x, x + h]$. As $h \to 0^+$, $\xi_h \to x$ and continuity gives $f(\xi_h) \to f(x)$. The case $h < 0$ is the same on $[x + h, x]$. Continuity of $f$ is exactly where the hypothesis enters; at a jump of $f$, $F$ has a corner.

*2.* $(G - F)' = f - f = 0$ on the interval, so by the mean value theorem $G - F$ is a constant $C$. Then $G(b) - G(a) = F(b) - F(a) = \int_a^b f - 0$.

*3.* With $F$ as in part 1, $\int_{u(x)}^{v(x)} f = F(v(x)) - F(u(x))$, and the chain rule with $F' = f$ gives $f(v)\,v' - f(u)\,u'$. A constant limit has derivative $0$ and contributes nothing, and a variable lower limit enters with a minus sign: $\frac{d}{dx}\int_x^5 f = -f(x)$.

**GATE use.** "If $F(x) = \int_x^{x^2} e^{t^2}\,dt$, find $F'(x)$": substitute each limit into the integrand and multiply by that limit's derivative, upper minus lower, without integrating. The integrand $e^{t^2}$ has no elementary antiderivative, which is the signal. The traps are the missing chain factor $v'(x) = 2x$ and the missing minus on the lower limit.

**Check.** $F(x) = \int_x^{x^2} e^{t^2}\,dt$ gives $F'(x) = 2x e^{x^4} - e^{x^2}$; at $x = 1.3$ this is $2.6\,e^{2.8561} - e^{1.69} = 39.80$, and a central difference of the Simpson-computed $F$ matches to $10^{-5}$. $\frac{d}{dx}\int_x^5 \sin t\,dt$ at $x = 1$ is $-0.841471 = -\sin 1$ numerically.

## Integration techniques
<!-- topics: em-calculus.integration-techniques, em-calculus.definite-integral-properties -->

**Claim.** On intervals where the integrands are continuous:

1. (Substitution) $\int f(g(x))\,g'(x)\,dx = F(g(x)) + C$ where $F' = f$, and $\int_a^b f(g(x))\,g'(x)\,dx = \int_{g(a)}^{g(b)} f(u)\,du$.
2. (Parts) $\int u\,dv = uv - \int v\,du$, and $\int_a^b u v'\,dx = \big[uv\big]_a^b - \int_a^b u' v\,dx$.
3. $\int x^n\,dx = \frac{x^{n+1}}{n+1}$ ($n \ne -1$), $\int \frac{dx}{x} = \ln\lvert x \rvert$, $\int \frac{dx}{1+x^2} = \arctan x$, $\int \frac{dx}{\sqrt{1-x^2}} = \arcsin x$ on $(-1, 1)$, each up to $+C$.
4. (Partial fractions) $\frac{1}{x^2 - 1} = \frac12\left(\frac{1}{x-1} - \frac{1}{x+1}\right)$, so $\int \frac{dx}{x^2-1} = \frac12\ln\left\lvert\frac{x-1}{x+1}\right\rvert + C$.

**Proof.** *1.* By the chain rule $\frac{d}{dx}F(g(x)) = f(g(x))\,g'(x)$, so $F \circ g$ is an antiderivative. For the definite form, the fundamental theorem gives $F(g(b)) - F(g(a))$, which is $\int_{g(a)}^{g(b)} f(u)\,du$. The new limits are $g(a)$ and $g(b)$ in that order even when $g(a) > g(b)$; the reversed integral is negative, and flipping it back to increasing order costs exactly one minus sign. Keeping the old limits after substituting is the usual error.

*2.* Integrate the product rule $(uv)' = u'v + uv'$ over $[a, b]$ and rearrange. The choice of $u$ (LIATE order: logarithmic, inverse trigonometric, algebraic, trigonometric, exponential) puts first the functions that simplify when differentiated, and leaves as $dv$ the ones that stay integrable. For $\int x e^x\,dx$, $u = x$ and $dv = e^x\,dx$ give $x e^x - \int e^x\,dx = (x - 1)e^x + C$.

*3.* Differentiate each right side. For $x < 0$, $\frac{d}{dx}\ln(-x) = \frac{-1}{-x} = \frac1x$, so $\ln\lvert x \rvert$ covers both signs; $\ln x$ is undefined on negative intervals. For $y = \arctan x$, differentiating $\tan y = x$ implicitly gives $\sec^2 y\,y' = 1$, so $y' = 1/(1 + \tan^2 y) = 1/(1 + x^2)$. For $y = \arcsin x \in [-\pi/2, \pi/2]$, $\cos y\,y' = 1$ and $\cos y = +\sqrt{1 - x^2}$ (cosine is non-negative there), so $y' = 1/\sqrt{1-x^2}$.

*4.* Write $\frac{1}{(x-1)(x+1)} = \frac{A}{x-1} + \frac{B}{x+1}$, so $1 = A(x+1) + B(x-1)$. At $x = 1$, $A = \tfrac12$; at $x = -1$, $B = -\tfrac12$. Integrate each term with part 3. A trigonometric substitution removes a root the same way: $x = a\sin\theta$ turns $\sqrt{a^2 - x^2}$ into $a\cos\theta$ for $\theta \in [-\pi/2, \pi/2]$, and $x = a\tan\theta$ turns $\sqrt{a^2 + x^2}$ into $a\sec\theta$.

**GATE use.** A one-mark NAT definite integral where an inner function and its derivative both appear: substitute and move the limits in the same step. A parts integral is often one step of a larger question, such as the Gamma integral. The traps are the unchanged limits, the lost minus sign of reversed limits, and $\ln x$ for $\ln\lvert x \rvert$.

**Check.** $\int_{1/\pi}^{2/\pi}\frac{\cos(1/x)}{x^2}\,dx$ with $u = 1/x$, $du = -dx/x^2$: the limits become $\pi$ and $\pi/2$, the integral becomes $\int_{\pi/2}^{\pi}\cos u\,du = \sin\pi - \sin\frac\pi2 = -1$; Simpson's rule gives $-1.000000$. $\int_0^{\pi/4} x\cos(x^2)\,dx = \tfrac12\sin(\pi^2/16) = 0.2892$. $\int_0^1 x e^x\,dx = [(x-1)e^x]_0^1 = 0 - (-1) = 1$. $\int_2^3\frac{dx}{x^2-1} = \tfrac12\ln\frac{2/4}{1/3} = \tfrac12\ln 1.5 = 0.2027$. $\int_{-2}^{-1}\frac{dx}{x} = \ln 1 - \ln 2 = -0.6931$. $\int_0^1\sqrt{1 - x^2}\,dx = \int_0^{\pi/2}\cos^2\theta\,d\theta = \pi/4$. All agree with Simpson's rule to at least five places.

## Symmetry, the king's rule and area
<!-- topics: em-calculus.definite-integral-properties, em-calculus.improper-and-area -->

**Claim.** For $f$ continuous on the intervals involved:

1. $\int_a^b f = \int_a^c f + \int_c^b f$ for any $c$, and $\int_a^b f = -\int_b^a f$.
2. $\int_{-a}^{a} f(x)\,dx = 0$ if $f$ is odd ($f(-x) = -f(x)$) and $2\int_0^a f(x)\,dx$ if $f$ is even ($f(-x) = f(x)$).
3. (King's rule) $\int_a^b f(x)\,dx = \int_a^b f(a + b - x)\,dx$; in particular $\int_0^a f(x)\,dx = \int_0^a f(a - x)\,dx$.
4. The area between $y = f(x)$ and $y = g(x)$ over $[a, b]$ is $\int_a^b \lvert f(x) - g(x) \rvert\,dx$, computed by splitting $[a, b]$ at every crossing.

**Proof.** *1.* With an antiderivative $G$: $G(b) - G(a) = (G(c) - G(a)) + (G(b) - G(c))$ and $G(b) - G(a) = -(G(a) - G(b))$.

*2.* Split at $0$. In $\int_{-a}^0 f(x)\,dx$ substitute $x = -t$, $dx = -dt$; the limits $-a, 0$ become $a, 0$, so it equals $\int_a^0 f(-t)(-dt) = \int_0^a f(-t)\,dt$. Hence $\int_{-a}^a f = \int_0^a \big(f(t) + f(-t)\big)\,dt$, which is $0$ for odd $f$ and $2\int_0^a f$ for even $f$. Any $f$ splits as an even part $\frac{f(x) + f(-x)}{2}$ plus an odd part $\frac{f(x) - f(-x)}{2}$, so only the even part survives on a symmetric interval. For an improper integral the odd-part cancellation needs each half to converge.

*3.* Substitute $x = a + b - t$, $dx = -dt$; the limits $a, b$ become $b, a$, and the reversal cancels the minus sign: $\int_a^b f(x)\,dx = \int_a^b f(a + b - t)\,dt$. The rule pays off when $f(x) + f(a + b - x)$ is simple: writing $I$ both ways and adding gives $2I = \int_a^b \big(f(x) + f(a+b-x)\big)\,dx$.

For $I = \int_0^{\pi/2}\frac{\sqrt{\sin x}}{\sqrt{\sin x} + \sqrt{\cos x}}\,dx$, replacing $x$ by $\pi/2 - x$ swaps $\sin$ and $\cos$, so the two integrands add to $1$ and $2I = \pi/2$, $I = \pi/4$. For $I = \int_0^\pi x\sin x\,dx$, the rule gives $I = \int_0^\pi (\pi - x)\sin x\,dx$, so $2I = \pi\int_0^\pi \sin x\,dx = 2\pi$ and $I = \pi$. For $\int_0^1 \frac{\ln(1+x)}{1+x^2}\,dx$, $x = \tan\theta$ turns it into $\int_0^{\pi/4}\ln(1 + \tan\theta)\,d\theta$, and $1 + \tan(\pi/4 - \theta) = \frac{2}{1 + \tan\theta}$, so the two forms add to $\ln 2$ and the value is $\frac\pi8\ln 2$.

*4.* Area counts the vertical gap $\lvert f - g \rvert$ as a non-negative height. On a piece where $f \ge g$ the integral $\int (f - g)$ is that piece's area; where $f < g$ it is minus the area. A single signed integral across a crossing therefore subtracts areas instead of adding them. Between consecutive crossings $f - g$ keeps one sign by the intermediate value theorem, so splitting there and adding absolute values gives the area.

**GATE use.** A one-mark integral on $[-a, a]$ where the odd part vanishes, or on $[0, a]$ where the king's rule makes the integrand collapse after adding. An area MCQ with options containing the area under each curve alone. The traps are cancelling a non-odd term, forgetting the $\frac12$ after adding the two forms, and integrating $\sin x$ over $[0, 2\pi]$ to get area $0$.

**Check.** $\int_{-1}^1 (x^3 + x^2)\,dx = 0 + 2 \cdot \tfrac13 = 2/3$. Simpson's rule gives $0.785398 = \pi/4$ for the $\sqrt{\sin x}$ integral, $3.141593 = \pi$ for $\int_0^\pi x\sin x\,dx$, and $0.272198 = \frac\pi8\ln 2$ for the logarithm integral. $y = x$ and $y = x^2$ meet at $0$ and $1$ with the line on top, and $\int_0^1 (x - x^2)\,dx = \tfrac12 - \tfrac13 = 1/6$. $\int_0^{2\pi}\sin x\,dx = 0$, while the area between $\sin x$ and the axis over $[0, 2\pi]$ is $2 + 2 = 4$.

## Improper integrals: Gamma, Gaussian and Wallis
<!-- topics: em-calculus.improper-and-area -->

**Claim.** An improper integral is the limit of proper ones: $\int_a^\infty f = \lim_{b\to\infty}\int_a^b f$ when the limit exists. Then, for integers $n \ge 0$ and $a > 0$,

$$\int_0^\infty x^n e^{-x}\,dx = n!, \qquad \int_0^\infty x^n e^{-ax}\,dx = \frac{n!}{a^{n+1}}, \qquad \int_0^\infty e^{-x^2}\,dx = \frac{\sqrt\pi}{2},$$

and with $W_n = \int_0^{\pi/2}\sin^n x\,dx$,

$$W_n = \frac{n-1}{n}\,W_{n-2}, \qquad W_0 = \frac\pi2,\ W_1 = 1, \qquad \int_0^{\pi/2}\cos^n x\,dx = W_n.$$

So $W_n = \frac{(n-1)(n-3)\cdots}{n(n-2)\cdots}$ times $\pi/2$ for even $n$ and times $1$ for odd $n$, the products running down to $1$ or $2$. Over $[0, \pi]$, $\int_0^\pi \sin^n x\,dx = 2W_n$ for every $n$, while $\int_0^\pi\cos^n x\,dx$ is $2W_n$ for even $n$ and $0$ for odd $n$.

**Derivation.** *Gamma.* $\int_0^b e^{-x}\,dx = 1 - e^{-b} \to 1$, so $I_0 = 1$. For $n \ge 1$, parts with $u = x^n$, $dv = e^{-x}dx$ on $[0, b]$ gives

$$\int_0^b x^n e^{-x}\,dx = \big[-x^n e^{-x}\big]_0^b + n\int_0^b x^{n-1}e^{-x}\,dx.$$

The boundary term is $-b^n e^{-b}$, which tends to $0$: from the series, $e^b > b^{n+1}/(n+1)!$ for $b > 0$, so $b^n e^{-b} < (n+1)!/b$. Letting $b \to \infty$, $I_n = n I_{n-1}$, and induction from $I_0 = 1$ gives $I_n = n!$. Substituting $x = t/a$, $dx = dt/a$, in $\int_0^\infty x^n e^{-ax}\,dx$ gives $\int_0^\infty (t/a)^n e^{-t}\,dt/a = n!/a^{n+1}$.

*Gaussian.* Let $I = \int_0^\infty e^{-x^2}\,dx$, which converges because $e^{-x^2} \le e^{-x}$ for $x \ge 1$. Then $I^2 = \int_0^\infty\int_0^\infty e^{-(x^2 + y^2)}\,dx\,dy$ over the first quadrant. In polar coordinates $x = r\cos\theta$, $y = r\sin\theta$ with area element $r\,dr\,d\theta$,

$$I^2 = \int_0^{\pi/2}\int_0^\infty e^{-r^2}\,r\,dr\,d\theta = \frac\pi2\cdot\Big[-\tfrac12 e^{-r^2}\Big]_0^\infty = \frac\pi2\cdot\frac12 = \frac\pi4,$$

and $I > 0$, so $I = \sqrt\pi/2$. The factor $r$ is what makes the inner integral elementary.

*Wallis.* For $n \ge 2$, parts with $u = \sin^{n-1}x$, $dv = \sin x\,dx$, $v = -\cos x$:

$$W_n = \big[-\sin^{n-1}x\cos x\big]_0^{\pi/2} + (n-1)\int_0^{\pi/2}\sin^{n-2}x\cos^2 x\,dx.$$

The boundary term is $0$ at both ends. Writing $\cos^2 x = 1 - \sin^2 x$ gives $W_n = (n-1)(W_{n-2} - W_n)$, so $nW_n = (n-1)W_{n-2}$. $W_0 = \pi/2$ and $W_1 = \int_0^{\pi/2}\sin x\,dx = 1$ start the two chains. The king's rule with $\sin(\pi/2 - x) = \cos x$ shows the cosine integral equals $W_n$. On $[0, \pi]$, $\sin(\pi - x) = \sin x$, so the integrand is symmetric about $\pi/2$ and the integral is $2W_n$. For cosine, $\cos(\pi - x) = -\cos x$, so $\cos^n(\pi - x) = (-1)^n\cos^n x$: the two halves are equal for even $n$ and cancel for odd $n$.

**GATE use.** Quote the value at once: $\int_0^\infty x^2 e^{-x}dx = 2$, $\int_0^{\pi/2}\sin^4 x\,dx = 3\pi/16$. Area problems combine with these. The traps are $n!$ versus $(n-1)!$ (it is $\Gamma(n + 1) = n!$), forgetting the $a^{n+1}$ for $e^{-ax}$, writing $\sqrt\pi$ for the half-line Gaussian, and applying the $[0, \pi]$ doubling to an odd power of cosine.

**Check.** Simpson's rule on truncated ranges gives $\int_0^\infty e^{-x}dx = 1$, $\int_0^\infty x^2 e^{-x}dx = 2$, $\int_0^\infty x^3 e^{-x}dx = 6$, $\int_0^\infty x^2 e^{-2x}dx = 2/8 = 0.25$ and $\int_0^\infty e^{-x^2}dx = 0.886227 = \sqrt\pi/2$. Wallis: $W_2 = \frac12\cdot\frac\pi2 = \pi/4$, $W_3 = \frac23$, $W_4 = \frac34\cdot\frac12\cdot\frac\pi2 = 3\pi/16$, $W_5 = \frac45\cdot\frac23 = 8/15$, $W_6 = 5\pi/32$, all matching quadrature to $10^{-9}$, as do $\int_0^{\pi/2}\cos^4 x\,dx = 3\pi/16$, $\int_0^\pi\sin^3 x\,dx = 4/3$, $\int_0^\pi\cos^3 x\,dx = 0$ and $\int_0^\pi\cos^4 x\,dx = 3\pi/8$.

## Partial derivatives, the gradient and two-variable extrema
<!-- topics: em-calculus.multivariable -->

**Claim.** Let $f(x, y)$ have continuous second partial derivatives near the points considered.

1. (Clairaut) $f_{xy} = f_{yx}$.
2. For a unit vector $\hat u$, the directional derivative $D_{\hat u}f = \frac{d}{dt}f(p + t\hat u)\big\rvert_{t=0}$ equals $\nabla f(p)\cdot\hat u$. Its maximum over unit vectors is $\lVert\nabla f(p)\rVert$, attained along $\nabla f(p)$. The same holds in three variables.
3. At a critical point $p$ ($\nabla f(p) = 0$) let $A = f_{xx}(p)$, $B = f_{xy}(p)$, $C = f_{yy}(p)$ and $D = AC - B^2$. If $D > 0$ and $A > 0$, $p$ is a strict local minimum; if $D > 0$ and $A < 0$, a strict local maximum; if $D < 0$, a saddle point; $D = 0$ is inconclusive.

**Proof.** *1.* Consider $\Delta(h, k) = f(a+h, b+k) - f(a+h, b) - f(a, b+k) + f(a, b)$. With $\varphi(x) = f(x, b+k) - f(x, b)$, $\Delta = \varphi(a + h) - \varphi(a) = h\,\varphi'(\xi) = h\big(f_x(\xi, b+k) - f_x(\xi, b)\big)$ for some $\xi$ between $a$ and $a + h$, and the mean value theorem in $y$ gives $\Delta = hk\,f_{xy}(\xi, \eta)$, where $f_{xy}$ means differentiate in $x$, then $y$. Grouping the four terms by $y$ first gives $\Delta = hk\,f_{yx}(\xi', \eta')$. Dividing by $hk$ and letting $(h, k) \to 0$, continuity of both mixed partials makes them equal at $(a, b)$.

*2.* Write $\hat u = (u_1, u_2)$. By the multivariable chain rule (valid since continuous partials make $f$ differentiable), $\frac{d}{dt}f(p + t\hat u) = f_x u_1 + f_y u_2 = \nabla f\cdot\hat u$ at $t = 0$. By the Cauchy–Schwarz inequality $\nabla f\cdot\hat u \le \lVert\nabla f\rVert\,\lVert\hat u\rVert = \lVert\nabla f\rVert$, with equality exactly when $\hat u$ points along $\nabla f$. A non-unit direction $v$ must be normalised first, since $\nabla f\cdot v$ scales with $\lVert v \rVert$.

*3.* For a small displacement $v = (h, k)$, Taylor's theorem applied to $t \mapsto f(p + tv)$ on $[0, 1]$, with first derivative $\nabla f(p)\cdot v = 0$ at $t = 0$, gives $f(p + v) - f(p) = \tfrac12 Q_\theta(h, k)$, where $Q_\theta = A_\theta h^2 + 2B_\theta hk + C_\theta k^2$ uses the second partials at the intermediate point $p + \theta v$, $0 < \theta < 1$. Take first the coefficients at $p$ itself. If $A \ne 0$, completing the square gives

$$A\,Q(h, k) = (Ah + Bk)^2 + (AC - B^2)k^2.$$

When $D > 0$ the right side is positive for $(h, k) \ne (0, 0)$ (if $k = 0$ then $h \ne 0$ and the square is $A^2h^2 > 0$), so $Q$ has the sign of $A$ in every direction. By continuity of the second partials, $D_\theta > 0$ and $A_\theta$ keeps the sign of $A$ for all $v$ small enough, so $f(p + v) - f(p)$ has the sign of $A$: a minimum for $A > 0$, a maximum for $A < 0$. When $D < 0$ and $A \ne 0$, $Q(1, 0) = A$ while $Q(-B, A) = AB^2 - 2AB^2 + CA^2 = A\,D$, of opposite sign; when $A = 0$, $D = -B^2 < 0$ forces $B \ne 0$, and $Q(h, k) = k(2Bh + Ck)$ changes sign with $h$ at fixed small $k$. Either way $f$ rises in one direction and falls in another arbitrarily close to $p$, which is a saddle. When $D = 0$ the quadratic part cannot decide: $x^4 + y^4$ (minimum) and $x^4 - y^4$ (saddle) both have all second partials $0$ at the origin. This is the treatment in Apostol, *Calculus* Vol. 2.

**GATE use.** "Find and classify the critical points of $f(x, y)$": solve $f_x = f_y = 0$, compute $A$, $B$, $C$ at each point and read off the sign of $D$. A directional-derivative NAT gives a direction that is not a unit vector. The traps are skipping the normalisation, using $A$ alone when $D < 0$, and calling $D = 0$ a saddle.

**Check.** $f = x^2 + y^2 - 4x$: $\nabla f = (2x - 4, 2y) = 0$ at $(2, 0)$, $A = 2$, $B = 0$, $C = 2$, $D = 4 > 0$, so a minimum with value $-4$; a grid search over $[1, 3] \times [-1, 1]$ finds the same minimum. For $f = x^2y + z$ at $(1, 1, 1)$, $\nabla f = (2xy, x^2, 1) = (2, 1, 1)$, along $(1, 2, 2)/3$ the directional derivative is $(2 + 2 + 2)/3 = 2$ (a numerical derivative agrees), and the maximum rate is $\sqrt6 = 2.4495$. For $f = x^3y^2 + \sin(xy)$ at $(0.7, 1.2)$, a centred second difference matches $f_{xy} = 6x^2y + \cos(xy) - xy\sin(xy)$. With $A = 2$, $B = 3$, $C = 1$, $Q(-3, 2) = -14 = A\,D$ while $Q(1, 0) = 2$.
