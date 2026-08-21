from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def test():
    print("Building manager...")
    num_nodes = 6
    manager = pywrapcp.RoutingIndexManager(num_nodes, 1, [0], [num_nodes - 1])
    routing = pywrapcp.RoutingModel(manager)

    dist_matrix = [
        [0, 10, 20, 15, 25, 30],
        [10, 0, 12, 18, 22, 28],
        [20, 12, 0, 10, 15, 20],
        [15, 18, 10, 0, 14, 18],
        [25, 22, 15, 14, 0, 10],
        [30, 28, 20, 18, 10, 0]
    ]

    def dist_cb(from_idx, to_idx):
        f = manager.IndexToNode(from_idx)
        t = manager.IndexToNode(to_idx)
        return dist_matrix[f][t]

    trans_idx = routing.RegisterTransitCallback(dist_cb)
    routing.SetArcCostEvaluatorOfAllVehicles(trans_idx)

    # Add distance dimension
    routing.AddDimension(trans_idx, 0, 1000, True, "Distance")
    dist_dim = routing.GetDimensionOrDie("Distance")

    # Pickup 1 -> Drop 2
    p1 = manager.NodeToIndex(1)
    d1 = manager.NodeToIndex(2)
    routing.AddPickupAndDelivery(p1, d1)
    routing.solver().Add(routing.VehicleVar(p1) == routing.VehicleVar(d1))
    routing.solver().Add(dist_dim.CumulVar(p1) <= dist_dim.CumulVar(d1))

    # Search params
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION
    )
    search_parameters.time_limit.seconds = 1

    print("Solving...")
    solution = routing.SolveWithParameters(search_parameters)
    print("Solution found?", solution is not None)
    if solution:
        idx = routing.Start(0)
        route = []
        while not routing.IsEnd(idx):
            route.append(manager.IndexToNode(idx))
            idx = solution.Value(routing.NextVar(idx))
        route.append(manager.IndexToNode(idx))
        print("Route:", route)

test()
