from models.sensor_models import DiagnosticAnalysis
import random

class DemoResponseService:
    def __init__(self):
        self.responses = {
            "engine_temperature": {
                "cause": "The marginal exceedance of the engine thermal threshold suggests a subtle compromise in the cooling system's efficiency. This could be due to a thermostat that is beginning to stick or is slightly slow to open fully, thus restricting adequate coolant flow to the radiator. Alternatively, a minor air pocket trapped within the cooling system can create localized hot spots or impede overall heat dissipation, leading to a fractional temperature rise. Reduced thermal transfer efficiency from an accumulation of internal scale or external debris on the radiator fins, or even an aging coolant with degraded properties, can also contribute to this slight but significant elevation.",
                "effect": "Operating the engine consistently, even slightly above its optimal thermal threshold, accelerates the degradation of engine oil, compromising its critical lubricating and cooling capabilities over time. This sustained mild overheating places undue stress on cooling system components such as hoses, seals, and plastic reservoirs, making them prone to premature cracking, leaks, or outright failure. If this minor temperature elevation is not addressed, it signals an underlying issue that could escalate rapidly, potentially leading to severe overheating, which risks cylinder head warpage, head gasket failure, and catastrophic internal engine damage, resulting in extensive and costly repairs.",
                "solution": "1. Conduct a thorough visual inspection of the entire cooling system, checking for any visible coolant leaks, damaged or swollen hoses, obstructed radiator fins, and verify the coolant reservoir level and fluid clarity.\n2. With the engine cooled, remove the radiator cap to confirm proper coolant level, then perform a cooling system pressure test to identify any internal or external leaks that might not be visible.\n3. Test the thermostat for proper operation by monitoring its opening and closing temperatures, and confirm that the engine cooling fan activates at the specified temperature and operates with sufficient airflow.",
                "prevention": "1. Adhere strictly to the manufacturer's recommended service schedule for cooling system flushes and coolant replacement, ensuring the correct type and concentration of coolant are always used.\n2. Periodically inspect the radiator and condenser for any accumulation of debris, bent fins, or other obstructions that could impede proper airflow, and verify the cooling fan's consistent and robust operation.\n3. Proactively check all cooling system hoses for signs of swelling, cracking, or softening, and replace the radiator cap at recommended intervals to ensure the system maintains optimal pressure."
            },
            "oil_pressure": {
                "cause": "Low oil pressure is most commonly caused by a severely compromised oil pump that is failing to circulate lubricant effectively throughout the engine block. This drop in hydraulic pressure can also stem from critically worn main or rod bearings, which allow excessive oil clearance and resultant pressure loss. Alternatively, a clogged oil pickup screen or a failing oil pressure relief valve stuck in the open position may be preventing the system from maintaining the necessary operational pressure.",
                "effect": "Without sufficient oil pressure, critical engine components such as the crankshaft, camshafts, and pistons lose their hydrodynamic lubrication barrier, leading to immediate metal-on-metal contact. This results in rapid, catastrophic wear, excessive heat generation, and potential seizure of moving parts. Continued operation under these conditions will almost certainly lead to total engine failure, requiring a complete engine rebuild or replacement.",
                "solution": "1. Immediately stop the engine and check the oil level; if low, top up to the correct level and inspect for external leaks.\n2. Attach a mechanical oil pressure gauge to verify the sensor reading and rule out a faulty sender unit.\n3. If low pressure is confirmed, drop the oil pan to inspect the oil pickup screen for blockage and check main bearings for excessive wear.",
                "prevention": "1. Perform regular oil and filter changes using high-quality synthetic oil that meets the manufacturer's specific viscosity requirements.\n2. Monitor engine sounds for ticking or knocking, which can be early indicators of lubrication issues before pressure drops critically.\n3. Use premium oil filters with anti-drain back valves to ensure immediate oil pressure on startup."
            },
            "brake_wear": {
                "cause": "The brake wear sensor has detected that the friction material on the brake pads has worn down to the minimum safe thickness, triggering the electrical circuit to close. This is a normal result of friction and usage over time, but accelerated wear can be caused by seized caliper slide pins, a sticking caliper piston, or driving habits involving frequent, heavy braking. In rare cases, a warped rotor can cause uneven pad contact, leading to premature wear on one side of the vehicle.",
                "effect": "Driving with worn brake pads significantly increases stopping distances and reduces overall braking efficiency, posing a severe safety risk to the driver and others. Once the friction material is depleted, the metal backing plate will grind directly against the rotor, causing deep scoring and permanent damage that necessitates costly rotor replacement. Furthermore, the excessive heat generated by metal-on-metal contact can lead to brake fade or complete system failure during emergency stops.",
                "solution": "1. Remove the wheels and inspect the brake pads on all four corners to confirm wear levels and rule out sensor malfunction.\n2. Replace brake pads in axle sets (both front or both rear) and inspect rotors for thickness and runout; resurface or replace rotors if necessary.\n3. Clean and lubricate caliper slide pins and contact points to ensure smooth operation and prevent future uneven wear.",
                "prevention": "1. Inspect brake pad thickness at every tire rotation or oil change service interval.\n2. Adopt a driving style that utilizes engine braking where appropriate to reduce thermal load and wear on the friction components.\n3. Ensure brake fluid is flushed every 2 years to prevent moisture buildup that can cause internal caliper corrosion and seizing."
            },
            "battery_voltage": {
                "cause": "The battery voltage has dropped below the critical threshold, indicating either a failure to hold a charge or a problem with the charging system. This is frequently caused by an aging battery cell that has lost its chemical capacity, a parasitic draw from an electrical component staying on when the vehicle is off, or a failing alternator that is unable to replenish the battery's charge while the engine is running. Corroded battery terminals can also create high resistance, mimicking a low voltage condition.",
                "effect": "A critically low battery voltage will prevent the vehicle from starting, leaving the driver stranded. It also places explicit strain on the alternator, which must work harder to charge a dying battery, potentially leading to premature alternator failure. Additionally, modern vehicle electronics and computer modules may behave erratically or reset their adaptive learning strategies due to unstable voltage supply.",
                "solution": "1. Perform a load test on the battery to determine its health and capacity; replace if it fails.\n2. Test the alternator output and charging system voltage to ensure it is providing between 13.5V and 14.5V under load.\n3. Clean battery terminals and cable ends to ensure a solid, corrosion-free electrical connection.",
                "prevention": "1. Visually inspect battery terminals for corrosion regularly and clean with a wire brush and terminal protector spray if needed.\n2. If the vehicle is parked for extended periods, use a battery tender or maintainer to keep the charge optimal.\n3. Replace the vehicle battery proactively every 3-5 years before it fails completely, especially in extreme climates."
            },
            "tire_pressure": {
                "cause": "The tire pressure monitoring system (TPMS) has detected a deviation from the recommended inflation pressure. This is most commonly caused by a slow leak from a puncture by a nail or screw, a leaking valve stem core, or purely natural pressure loss due to osmosis over time. Significant ambient temperature drops can also cause pressure to decrease, as air density changes with temperature.",
                "effect": "Driving on improperly inflated tires compromises vehicle handling, increases braking distances, and significantly elevates the risk of a catastrophic blowout at highway speeds. Under-inflation causes excessive heat buildup in the tire sidewalls, leading to structural failure, while also increasing rolling resistance which directly reduces fuel economy. Over-inflation reduces the contact patch with the road, leading to uneven center tread wear and reduced traction.",
                "solution": "1. Check the tire pressure in all four tires (and the spare) using a reliable digital gauge.\n2. Inspect the tire tread and sidewall for visible punctures, embedded objects, or damage.\n3. Inflate or deflate tires to the manufacturer's recommended PSI as listed on the door jamb placard.",
                "prevention": "1. Check tire pressures monthly when the tires are cold (before driving) to ensure accuracy.\n2. Visually inspect tires for uneven wear patterns which can indicate alignment issues or inflation problems.\n3. When replacing tires, always replace the valve stems or service the TPMS seals to prevent air leaks."
            }
        }

    def get_demo_diagnosis(self, component_name, value, unit, threshold) -> DiagnosticAnalysis:
        # Normalize component name
        key = component_name.lower().replace(" ", "_").replace("thermal", "temperature").replace("liquid", "oil").replace("friction", "brake").replace("energy", "battery").replace("pneumatic", "tire").replace("storage", "voltage").replace("load", "pressure").replace("material", "wear")
        
        # Mapping specific keys to generalized ones if needed
        # (The naming convention in sensor_models vs UI should be consistent, 
        #  but this ensures robustness)
        if "temp" in key: key = "engine_temperature"
        elif "oil" in key: key = "oil_pressure"
        elif "brake" in key: key = "brake_wear"
        elif "bat" in key: key = "battery_voltage"
        elif "tire" in key: key = "tire_pressure"

        response = self.responses.get(key, {
            "cause": "Demo Mode: Unable to determine specific cause for this component.",
            "effect": "Demo Mode: Potential performance degradation.",
            "solution": "1. Switch to Real Mode for AI diagnostics.\n2. Consult a manual.",
            "prevention": "N/A"
        })

        return DiagnosticAnalysis(
            cause=response["cause"],
            effect=response["effect"],
            solution=response["solution"],
            prevention=response["prevention"],
            diagnosisSource="Demo Mode"
        )

# Singleton instance
demo_service = DemoResponseService()

def get_demo_service():
    return demo_service
