import networkx as nx


class DependencyGraph:

    def __init__(self, factory_state):
        self.factory_state = factory_state
        self.graph = nx.DiGraph()

        self.build_graph()


    def build_graph(self):

        # Add machine nodes
        for machine in self.factory_state.machines:

            machine_id = machine["id"]

            self.graph.add_node(
                machine_id,
                type="machine",
                name=machine.get("name", machine_id)
            )


        # Add material nodes
        for material in self.factory_state.materials:

            material_id = material["id"]

            self.graph.add_node(
                material_id,
                type="material",
                name=material.get("name", material_id)
            )


        # Add order nodes
        for order in self.factory_state.orders:

            order_id = order["id"]

            self.graph.add_node(
                order_id,
                type="order",
                product=order["product"],
                priority=order["priority"]
            )


        # Connect scheduled machines to orders
        for task in self.factory_state.schedule:

            resource_id = task["resource_id"]
            order_id = task["order_id"]

            self.graph.add_edge(
                resource_id,
                order_id,
                relationship="scheduled_for"
            )


    def get_affected_nodes(self, node_id):

        if node_id not in self.graph:
            return []

        return list(nx.descendants(self.graph, node_id))


    def get_node_details(self, node_id):

        if node_id not in self.graph:
            return None

        return dict(self.graph.nodes[node_id])


    def get_dependencies(self, node_id):

        if node_id not in self.graph:
            return []

        dependencies = []

        for successor in self.graph.successors(node_id):

            dependencies.append({
                "id": successor,
                "relationship": self.graph.edges[node_id, successor].get(
                    "relationship"
                )
            })

        return dependencies