"use client";

import { FormEvent, useEffect, useState } from "react";

type FitmentResult = {
  year: string;
  make: string;
  model: string;
  trim: string;
  tireSizes: string[];
};

const currentYear = new Date().getFullYear();

const years = Array.from(
  { length: 30 },
  (_, index) => currentYear - index
);

export default function Home() {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [trim, setTrim] = useState("");

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [trims, setTrims] = useState<string[]>([]);

  const [result, setResult] = useState<FitmentResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!year) {
      setMakes([]);
      return;
    }

    async function loadMakes() {
      setError("");

      try {
        const response = await fetch(
          `/api/fitment?action=make&year=${year}`
        );

        if (!response.ok) {
          throw new Error();
        }

        const data: string[] = await response.json();

        setMakes(data);
      } catch {
        setError("Unable to load vehicle makes.");
      }
    }

    loadMakes();
  }, [year]);

  useEffect(() => {
    if (!year || !make) {
      setModels([]);
      return;
    }

    async function loadModels() {
      setError("");

      const params = new URLSearchParams({
        action: "model",
        year,
        make,
      });

      try {
        const response = await fetch(
          `/api/fitment?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error();
        }

        const data: string[] = await response.json();

        setModels(data);
      } catch {
        setError("Unable to load vehicle models.");
      }
    }

    loadModels();
  }, [year, make]);

  useEffect(() => {
    if (!year || !make || !model) {
      setTrims([]);
      return;
    }

    async function loadTrims() {
      setError("");

      const params = new URLSearchParams({
        action: "trim",
        year,
        make,
        model,
      });

      try {
        const response = await fetch(
          `/api/fitment?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error();
        }

        const data: string[] = await response.json();

        setTrims(data);
      } catch {
        setError("Unable to load vehicle trims.");
      }
    }

    loadTrims();
  }, [year, make, model]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    const params = new URLSearchParams({
      action: "fitment",
      year,
      make,
      model,
      trim,
    });

    try {
      const response = await fetch(
        `/api/fitment?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error();
      }

      const data: FitmentResult = await response.json();

      setResult(data);
    } catch {
      setError("Unable to find tire sizes for that vehicle.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setYear("");
    setMake("");
    setModel("");
    setTrim("");

    setMakes([]);
    setModels([]);
    setTrims([]);

    setResult(null);
    setError("");
  }

  return (
    <main>
      <h1>Tire Finder</h1>

      <p>Select your vehicle to find its standard tire size.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="year">Year</label>

          <select
            id="year"
            value={year}
            onChange={(event) => {
              setYear(event.target.value);
              setMake("");
              setModel("");
              setTrim("");
              setModels([]);
              setTrims([]);
              setResult(null);
            }}
            required
          >
            <option value="">Select year</option>

            {years.map((vehicleYear) => (
              <option key={vehicleYear} value={vehicleYear}>
                {vehicleYear}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="make">Make</label>

          <select
            id="make"
            value={make}
            onChange={(event) => {
              setMake(event.target.value);
              setModel("");
              setTrim("");
              setModels([]);
              setTrims([]);
              setResult(null);
            }}
            disabled={!year}
            required
          >
            <option value="">Select make</option>

            {makes.map((vehicleMake) => (
              <option key={vehicleMake} value={vehicleMake}>
                {vehicleMake}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="model">Model</label>

          <select
            id="model"
            value={model}
            onChange={(event) => {
              setModel(event.target.value);
              setTrim("");
              setTrims([]);
              setResult(null);
            }}
            disabled={!make}
            required
          >
            <option value="">Select model</option>

            {models.map((vehicleModel) => (
              <option key={vehicleModel} value={vehicleModel}>
                {vehicleModel}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="trim">Trim</label>

          <select
            id="trim"
            value={trim}
            onChange={(event) => {
              setTrim(event.target.value);
              setResult(null);
            }}
            disabled={!model}
            required
          >
            <option value="">Select trim</option>

            {trims.map((vehicleTrim) => (
              <option key={vehicleTrim} value={vehicleTrim}>
                {vehicleTrim}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Find Tire Size"}
        </button>

        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </form>

      {error && <p>{error}</p>}

      {result && (
        <section>
          <h2>
            {result.year} {result.make} {result.model} {result.trim}
          </h2>

          <h3>OEM Tire Size</h3>

          <ul>
            {result.tireSizes.map((size) => (
              <li key={size}>{size}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}