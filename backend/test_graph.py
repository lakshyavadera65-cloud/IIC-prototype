from app.core.factory_state import factory_state
from app.engines.dependency_graph import DependencyGraph


graph = DependencyGraph(factory_state)


print("\n--- GRAPH NODES ---")

for node, data in graph.graph.nodes(data=True):
    print(node, data)


print("\n--- CNC-02 IMPACT ---")

affected = graph.get_affected_nodes("CNC-02")

print(affected)