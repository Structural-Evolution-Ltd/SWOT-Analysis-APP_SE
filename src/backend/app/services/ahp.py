def compute_ahp_weights(sw: float, so: float, st: float, wo: float, wt: float, ot: float) -> dict[str, float]:
    import numpy as np  # lazy import: keeps Lambda cold-start free of numpy binary load
    matrix = np.array(
        [
            [1.0, sw, so, st],
            [1.0 / sw, 1.0, wo, wt],
            [1.0 / so, 1.0 / wo, 1.0, ot],
            [1.0 / st, 1.0 / wt, 1.0 / ot, 1.0],
        ],
        dtype=float,
    )

    eigvals, eigvecs = np.linalg.eig(matrix)
    max_idx = int(np.argmax(eigvals.real))
    principal = np.abs(eigvecs[:, max_idx].real)
    normalized = principal / principal.sum()

    return {
        "S": round(float(normalized[0]), 4),
        "W": round(float(normalized[1]), 4),
        "O": round(float(normalized[2]), 4),
        "T": round(float(normalized[3]), 4),
    }
