type Props = {
  title: string
}
export default function PageHeading(props: Props) {
  return (
    <header class="py-4 font-semibold">
      <h1 class="font-display uppercase leading-[0.94] text-4xl">{props.title}</h1>
    </header>
  )
}
