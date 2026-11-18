import numpy as np
from scipy.integrate import solve_ivp

class MetabolicPhysicsEngine:
    """
    Physics-Informed Minimal Metabolic ODE Model (Bergmann Minimal Model variant)
    Simulates blood glucose (G), remote insulin action (X), blood insulin (I),
    and liver glycogen reserves (S_glycogen) under meal interventions and physical activity.
    """
    def __init__(self, basal_glucose=90.0, basal_insulin=10.0, sensitivity=0.0005, insulin_elimination=0.05):
        self.Gb = basal_glucose        # mg/dL
        self.Ib = basal_insulin        # uU/mL
        self.p1 = 0.03                 # Glucose effectiveness (1/min)
        self.p2 = 0.02                 # Rate of decrease of insulin action (1/min)
        self.p3 = sensitivity          # Sensitivity parameter (1/(min^2 uU/mL))
        self.n = insulin_elimination   # Fractional rate of insulin degradation (1/min)
        self.gamma = 0.005             # Pancreas responsiveness
        self.h = basal_glucose         # Pancreas threshold

    def _ode_system(self, t, y, meal_carbs, meal_gi, activity_level):
        """
        y = [G, X, I, Glycogen]
        G: Blood glucose (mg/dL)
        X: Remote insulin action (1/min)
        I: Plasma insulin (uU/mL)
        Glycogen: Liver Glycogen reserve percentage (0 to 100%)
        """
        G, X, I, Glycogen = y

        # Meal glucose absorption rate D(t) modeled as double exponential decay
        # Absorbed carbs peak based on Glycemic Index (GI)
        peak_time = max(15.0, 45.0 - (meal_gi - 50.0) * 0.4) # High GI peaks faster (15-30 min)
        rate_const = 1.0 / peak_time
        D_t = (meal_carbs * 3.5) * (rate_const ** 2) * t * np.exp(-rate_const * t)


        # Physical activity increases glucose clearance and muscle glucose uptake
        activity_clearance = 0.0015 * activity_level

        # ODE Equations
        # dG/dt = - (p1 + X + activity_clearance) * G + p1 * Gb + D(t)
        dG_dt = -(self.p1 + X + activity_clearance) * G + self.p1 * self.Gb + D_t

        # dX/dt = - p2 * X + p3 * (I - Ib)
        dX_dt = -self.p2 * X + self.p3 * max(0, I - self.Ib)

        # dI/dt = gamma * max(0, G - h) * t - n * (I - Ib)
        dI_dt = self.gamma * max(0, G - self.h) - self.n * max(0, I - self.Ib)

        # Glycogen dynamics: excess glucose stored, low glucose/high activity depletes
        glycogen_change = 0.01 * max(0, G - 120.0) - 0.02 * activity_level - 0.005 * max(0, 90.0 - G)
        dGlycogen_dt = glycogen_change

        return [dG_dt, dX_dt, dI_dt, dGlycogen_dt]

    def simulate_trajectory(self, duration_hours=4.0, meal_carbs=50.0, meal_gi=65.0, activity_level=1.0, initial_state=None):
        """
        Simulates 24-hour or multi-hour dynamic trajectory.
        Returns time points, blood glucose, insulin, and organ stress metrics.
        """
        if initial_state is None:
            initial_state = [self.Gb, 0.0, self.Ib, 85.0]

        t_span = (0, duration_hours * 60.0) # minutes
        t_eval = np.linspace(0, duration_hours * 60.0, int(duration_hours * 60))

        sol = solve_ivp(
            self._ode_system,
            t_span,
            initial_state,
            args=(meal_carbs, meal_gi, activity_level),
            t_eval=t_eval,
            method='RK45'
        )

        t_min = sol.t
        G_vals = sol.y[0]
        X_vals = sol.y[1]
        I_vals = sol.y[2]
        Glycogen_vals = np.clip(sol.y[3], 20.0, 100.0)

        # Calculate organ metabolic stress heatmaps
        # Pancreas stress: elevated insulin secretion demands
        pancreas_stress = np.clip((I_vals - self.Ib) / 40.0 * 100.0, 5, 100)
        # Liver stress: glucose variability + glycogen saturation/depletion
        liver_stress = np.clip(np.abs(G_vals - self.Gb) / 60.0 * 70.0 + (100 - Glycogen_vals) * 0.3, 5, 100)
        # Vascular/Heart stress: glucose spikes above 100 mg/dL + activity
        heart_stress = np.clip(np.maximum(0, G_vals - 100) * 0.8 + activity_level * 15.0, 10, 95)
        # Muscle metabolic activity score
        muscle_activity = np.clip(activity_level * 25.0 + X_vals * 1000.0, 5, 100)
        # Brain glucose supply adequacy
        brain_clarity = np.clip(100.0 - np.maximum(0, 70.0 - G_vals) * 2.0 - np.maximum(0, G_vals - 160.0) * 0.8, 20, 100)


        trajectory_data = []
        for i in range(len(t_min)):
            time_h = float(round(t_min[i] / 60.0, 2))
            trajectory_data.append({
                "time_min": int(t_min[i]),
                "time_hours": time_h,
                "glucose": float(round(G_vals[i], 1)),
                "insulin": float(round(I_vals[i], 1)),
                "glycogen": float(round(Glycogen_vals[i], 1)),
                "pancreas_stress": float(round(pancreas_stress[i], 1)),
                "liver_stress": float(round(liver_stress[i], 1)),
                "heart_stress": float(round(heart_stress[i], 1))
            })


        summary = {
            "peak_glucose": round(float(np.max(G_vals)), 1),
            "time_to_peak_min": int(t_min[np.argmax(G_vals)]),
            "area_under_curve": round(float(np.trapz(G_vals, t_min)), 1),
            "avg_pancreas_stress": round(float(np.mean(pancreas_stress)), 1),
            "avg_liver_stress": round(float(np.mean(liver_stress)), 1),
            "avg_heart_stress": round(float(np.mean(heart_stress)), 1),
            "avg_muscle_activity": round(float(np.mean(muscle_activity)), 1),
            "avg_brain_clarity": round(float(np.mean(brain_clarity)), 1)
        }

        return {
            "trajectory": trajectory_data,
            "summary": summary
        }
