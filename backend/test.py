from app.core.factory_state import factory_state

print("FACTORY STATE LOADED SUCCESSFULLY")
print()

print("Machines:", len(factory_state.machines))
print("Materials:", len(factory_state.materials))
print("Orders:", len(factory_state.orders))
print("Schedule tasks:", len(factory_state.schedule))

print()
print("CNC-02:")
print(factory_state.get_machine("CNC-02"))