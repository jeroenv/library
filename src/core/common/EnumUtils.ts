export default class EnumUtils {
  getOrdinal<T>(enumType: T, value: number): number {
    return Object.keys(enumType).indexOf(value.toString());
  }
}
